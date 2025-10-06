// src/routes/violation.ts
import type { FastifyInstance } from 'fastify';
import { prisma } from '@lib/prisma';
import { Prisma } from '@prisma/client'
import { sendEmail, sendSMS } from '@lib/notifier';
import {
    getPagination,
    toDate,
    generateId,
    toEnum,
    parseSort,
    VIOLATION_STATUS,
    VIOLATION_TYPES,
    ViolationType
} from './_utils';
import { startOfDay, subDays } from 'date-fns';
import { broadcastEvent } from './events';
import fs from 'fs';
import path from 'path';

export default async function violationRoutes(app: FastifyInstance) {
    /**
     * GET /api/violations
     * Query:
     *  q             (search id / snapshotUrl)
     *  from, to      (Date range on ts)
     *  status        (open|resolved)
     *  type|kind     (no_helmet|no_mask|no_vest|no_gloves)
     *  page/pageSize | skip/take
     *  sort          ("ts:desc,confidence:asc,status:asc,id:asc")
     */
    app.get('/violations', async (req) => {
        const {skip, take} = getPagination(req);
        const q = req.query as any;

        const keyword = (q.keyword as string | undefined)?.trim();
        const from = q.from ? new Date(Number(q.from)) : undefined;
        const to = q.to ? new Date(Number(q.to)) : undefined;
        const status = toEnum(q.status, VIOLATION_STATUS);
        const kind = toEnum(q.type ?? q.kind, VIOLATION_TYPES);

        const where: any = {AND: []};

        // Time filter
        if (from || to) {
            where.AND.push({
                ts: {
                    ...(from ? {gte: from} : {}),
                    ...(to ? {lte: to} : {}),
                },
            });
        }

        // Status filter
        if (status) {
            where.AND.push({status});
        }

        // Kind filter
        if (kind) {
            where.AND.push({kinds: {some: {type: kind}}});
        }

        // Keyword filter
        if (keyword) {
            if (keyword.startsWith('VIO')) {
                where.AND.push({id: keyword});
            } else {
                const statusFromKeyword = toEnum(keyword.toLowerCase(), VIOLATION_STATUS);
                const kindFromKeyword = toEnum(keyword, VIOLATION_TYPES);

                where.AND.push({
                    OR: [
                        {snapshotUrl: {contains: keyword}},   // removed mode
                        {handler: {contains: keyword}},       // removed mode
                        statusFromKeyword ? {status: statusFromKeyword} : undefined,
                        kindFromKeyword ? {kinds: {some: {type: kindFromKeyword}}} : undefined,
                    ].filter(Boolean),
                });
            }
        }


        if (where.AND.length === 0) {
            delete where.AND;
        }

        const orderBy =
            parseSort<Prisma.ViolationOrderByWithRelationInput>(
                (req.query as any)?.sort,
                ['ts', 'status', 'id']
            ) || [{ts: 'desc'}];

        app.log.info({rawQuery: q, where, skip, take, orderBy}, 'violations query');

        const [items, total] = await Promise.all([
            prisma.violation.findMany({
                where,
                skip,
                take,
                orderBy,
                include: {kinds: true},
            }),
            prisma.violation.count({where}),
        ]);
        for (const v of items) {
            if (v.snapshotUrl && !v.snapshotUrl.startsWith('http')) {
                v.snapshotUrl = `/uploads/${path.basename(v.snapshotUrl)}`;
            }
        }
        
        return {items, total, skip, take, orderBy};
    });


    /**
     * GET /api/violations/:id
     */
    app.get('/violations/:id', async (req) => {
        const {id} = req.params as { id: string };
        return prisma.violation.findUniqueOrThrow({
            where: {id},
            include: {kinds: true, notices: true, bookmarkedBy: true},
        });
    });

    app.get('/violations/stats/status', async () => {
        const todayStart = startOfDay(new Date());
        const yesterdayStart = startOfDay(subDays(new Date(), 1));

        const [open, resolved, all, todayCount, yesterdayCount] = await Promise.all([
            // Count violations with status = "open"
            prisma.violation.count({where: {status: 'open'}}),

            // Count violations with status = "resolved"
            prisma.violation.count({where: {status: 'resolved'}}),

            // Count all violations
            prisma.violation.count(),

            // Count today's violations (timestamp >= today start)
            prisma.violation.count({where: {ts: {gte: todayStart}}}),

            // Count yesterday's violations (timestamp between yesterday and today)
            prisma.violation.count({
                where: {ts: {gte: yesterdayStart, lt: todayStart}},
            }),
        ]);

        return {
            open,
            resolved,
            all,
            today: todayCount,
            trend: todayCount - yesterdayCount, // Positive = increase, negative = decrease
        };
    });
    /**
     * PATCH /api/violations/:id/resolve
     * Resolve a violation and set handler from authenticated user
     */
    // PATCH /violations/:id/resolve
    /**
     * PATCH /violations/:id/resolve
     * Mark violation as resolved + send notifications
     */
    app.patch(
        '/violations/:id/resolve',
        { preValidation: [app.authenticate] },
        async (req, reply) => {
            const { id } = req.params as { id: string };

            // get userId from JWT
            const user: any = (req as any).user;
            const userId = user?.id;

            // default handler = "system"
            let handler = 'system';

            if (userId) {
                const dbUser = await prisma.user.findUnique({
                    where: { id: userId },
                    select: { username: true },
                });
                if (dbUser?.username) handler = dbUser.username;
            }

            // update violation status
            const updated = await prisma.violation.update({
                where: { id },
                data: { status: 'resolved', handler },
            });

            // create a notification
            const notif = await prisma.notification.create({
                data: {
                    id: generateId("NTF"),
                    type: 'resolved',
                    status: 'unhandled',
                    violationId: updated.id,
                    message: `Violation resolved by ${handler}`,
                    userId,
                },
            });

            // send to all contacts
            const contacts = await prisma.contact.findMany();
            // === Load notification types from systemConfig ===
            const systemConfig = await prisma.systemConfig.findMany();
            const notifTypesStr =
                systemConfig.find((c) => c.key === 'notification_types')?.value || '[]';
            const notifTypes = JSON.parse(notifTypesStr) as string[];

            // === Load SMTP and SMS config values ===
            const smtpSender = systemConfig.find((c) => c.key === 'smtp_sender')?.value;
            const smsFrom = systemConfig.find((c) => c.key === 'sms_from')?.value;

            // === Send notifications based on config ===
            for (const c of contacts) {
                // Send email if EMAIL is enabled
                if (notifTypes.includes('EMAIL') && c.email && smtpSender) {
                    await sendEmail(
                        c.email,
                        'Violation Resolved',
                        `The violation ${id} was resolved by ${handler}.`
                    );
                }

                // Send SMS if SMS is enabled
                if (notifTypes.includes('SMS') && c.phone && smsFrom) {
                    await sendSMS(
                        c.phone,
                        `The violation ${id} was resolved by ${handler}.`
                    );
                }
            }
            broadcastEvent({ type: 'violation_resolved', id });
            return updated;
        }
    );

    /**
     * POST /violations
     * Body: { id, confidence?, snapshotUrl?, status? }
     */



    app.post('/violations', async (req, reply) => {
        const newId = generateId("VIO");
        let filePath: string | null = null;
        let kinds: string[] = [];

        const parts = req.parts();
        for await (const part of parts) {
            if (part.type === 'file') {
                const uploadDir = path.join(process.cwd(), 'uploads');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                filePath = path.join(uploadDir, `${newId}_${part.filename}`);
                await fs.promises.writeFile(filePath, await part.toBuffer());
            } else if (part.type === 'field' && part.fieldname === 'kinds') {
                try {
                    kinds = JSON.parse(part.value as string);
                } catch {
                    kinds = [];
                }
            }
        }

        const created = await prisma.violation.create({
            data: {
                id: newId,
                snapshotUrl: filePath,
                status: 'open',
                kinds: {
                    create: kinds.map((k) => ({ type: k as ViolationType })),
                },
            },
            include: { kinds: true },
        });

        await prisma.notification.create({
            data: {
                id: generateId("NTF"),
                type: 'violation',
                status: 'unhandled',
                violationId: created.id,
                message: 'New violation detected',
            },
        });
        // === Conditional SMS/Email notification ===
        try {
            // Load system configs
            const config = await prisma.systemConfig.findMany();

            // Notification types enabled in system (e.g. ["EMAIL","SMS"])
            const enabledNotifications = JSON.parse(
                config.find((c) => c.key === 'notification_types')?.value || '[]'
            ) as string[];

            // Allowed PPE violation types (e.g. ["Helmet","Mask","Goggles","Safety Boots"])
            const allowedTypes = JSON.parse(
                config.find((c) => c.key === 'ppe_types')?.value || '[]'
            ) as string[];

            // === Filter: Only send notifications if detected kinds are in allowedTypes ===
            const validKinds = kinds.filter((k) => allowedTypes.includes(k));
            if (validKinds.length === 0) {
                console.log('⚠️ No valid violation types for notification, skipping.');
                return reply.code(201).send(created);
            }

            // === SMS Notifications ===
            if (enabledNotifications.includes('SMS')) {
                const contacts = await prisma.contact.findMany({ where: { phone: { not: null } } });
                for (const contact of contacts) {
                    if (!contact.phone) continue;
                    const msg = `🚨 PPE Violation Detected (${created.id})\nType(s): ${validKinds.join(', ')}`;
                    await sendSMS(contact.phone, msg);
                    console.log(`📨 SMS sent to ${contact.name}: ${contact.phone}`);
                }
            }

            // === Email Notifications ===
            if (enabledNotifications.includes('EMAIL')) {
                const contacts = await prisma.contact.findMany({ where: { email: { not: null } } });
                for (const contact of contacts) {
                    if (!contact.email) continue;
                    const subject = `PPE Violation Detected (${created.id})`;
                    const text = `A new PPE violation was detected.\nType(s): ${validKinds.join(', ')}\n\nCheck the dashboard for more details.`;
                    await sendEmail(contact.email, subject, text);
                    console.log(`📧 Email sent to ${contact.name}: ${contact.email}`);
                }
            }
        } catch (err) {
            if (err instanceof Error) {
                console.error('❌ Notification error:', err.message);
            } else {
                console.error('❌ Notification error:', err);
            }
        }


        broadcastEvent({ type: 'violation_created', id: newId });
        console.log('📢 Broadcast violation_created', created.id);

        reply.code(201).send(created);
    });

    /**
     * PATCH /api/violations/:id
     */
    app.patch('/violations/:id', async (req) => {
        const {id} = req.params as { id: string };
        const body = req.body as Partial<{
            snapshotUrl: string | null;
            status: (typeof VIOLATION_STATUS)[number];
            kinds: (typeof VIOLATION_TYPES)[number][];
        }>;

        const tx: any[] = [];
        if (body.kinds) {
            tx.push(
                prisma.violationKind.deleteMany({where: {violationId: id}}),
                prisma.violationKind.createMany({
                    data: [...new Set(body.kinds)].map((k) => ({violationId: id, type: k})),
                }),
            );
        }

        const update = prisma.violation.update({
            where: {id},
            data: {
                snapshotUrl: body.snapshotUrl ?? undefined,
                status: body.status ?? undefined,
            },
            include: {kinds: true},
        });

        const [updated] = await prisma.$transaction([...tx, update]);
        return updated ?? (await update);
    });

    /**
     * DELETE /api/violations/:id
     */
    app.delete('/violations/:id', async (req, reply) => {
        const {id} = req.params as { id: string };
        await prisma.violation.delete({where: {id}});
        reply.code(204).send();
    });

    /**
     * POST /api/violations/:id/bookmark
     * Body: { userId: string }
     */
    app.post('/violations/:id/bookmark', async (req, reply) => {
        const {id: violationId} = req.params as { id: string };
        const {userId} = req.body as { userId: string };
        if (!userId) return reply.code(400).send({message: 'userId is required'});

        try {
            await prisma.userViolationBookmark.create({data: {userId, violationId}});
        } catch (e: any) {
            if (e?.code !== 'P2002') throw e;
        }
        reply.code(201).send({ok: true});
    });

    /**
     * DELETE /api/violations/:id/bookmark?userId=USR001
     */
    app.delete('/violations/:id/bookmark', async (req, reply) => {
        const {id: violationId} = req.params as { id: string };
        const {userId} = req.query as { userId?: string };
        if (!userId) return reply.code(400).send({message: 'userId is required'});

        await prisma.userViolationBookmark.delete({
            where: {userId_violationId: {userId, violationId}},
        });
        reply.code(204).send();
    });

    /**
     * GET /api/violations/stats/daily?days=7
     */
    app.get('/violations/stats/daily', async (req) => {
        const days = Math.min(Number((req.query as any)?.days ?? 7), 60);
        const since = new Date();
        since.setDate(since.getDate() - days + 1);

        const rows = await prisma.violation.findMany({
            where: {ts: {gte: since}},
            select: {ts: true},
            orderBy: {ts: 'asc'},
        });

        const bucket = new Map<string, number>();
        for (const r of rows) {
            const key = r.ts.toISOString().slice(0, 10);
            bucket.set(key, (bucket.get(key) ?? 0) + 1);
        }
        return Array.from(bucket, ([date, count]) => ({date, count}));
    });
}
