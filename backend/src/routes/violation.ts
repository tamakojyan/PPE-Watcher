// src/routes/violation.ts
import type { FastifyInstance } from 'fastify';
import { prisma } from '@lib/prisma';
import { Prisma } from '@prisma/client'
import { sendEmail, sendSMS } from '@lib/notifier';
import {
    getPagination,
    toDate,
    toEnum,
    parseSort,
    VIOLATION_STATUS,
    VIOLATION_TYPES,
} from './_utils';
import { startOfDay, subDays } from 'date-fns';


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
                    id: `NTF_${Date.now()}`,
                    type: 'resolved',
                    status: 'unhandled',
                    violationId: updated.id,
                    message: `Violation resolved by ${handler}`,
                    userId,
                },
            });

            // send to all contacts
            const contacts = await prisma.contact.findMany();
            for (const c of contacts) {
                if (c.email)
                    await sendEmail(c.email, 'Violation Resolved', notif.message || '');
                if (c.phone)
                    await sendSMS(c.phone, notif.message || '');
            }

            return updated;
        }
    );

    /**
     * POST /violations
     * Body: { id, confidence?, snapshotUrl?, status? }
     */
    app.post('/violations', async (req, reply) => {
        const body = req.body as {
            id: string;
            confidence?: number | null;
            snapshotUrl?: string | null;
            status?: (typeof VIOLATION_STATUS)[number];
        };

        // create violation
        const created = await prisma.violation.create({
            data: {
                id: body.id,
                confidence: body.confidence ?? null,
                snapshotUrl: body.snapshotUrl ?? null,
                status: body.status ?? 'open',
            },
        });

        // create notification
        const notif = await prisma.notification.create({
            data: {
                id: `NTF_${Date.now()}`,
                type: 'violation',
                status: 'unhandled',
                violationId: created.id,
                message: 'New violation detected',
            },
        });

        // send to all contacts
        const contacts = await prisma.contact.findMany();
        for (const c of contacts) {
            if (c.email)
                await sendEmail(c.email, 'New Violation', notif.message || '');
            if (c.phone)
                await sendSMS(c.phone, notif.message || '');
        }

        reply.code(201).send(created);
    });
    /**
     * PATCH /api/violations/:id
     * Body 可包含：confidence / snapshotUrl / status / kinds（若提供 kinds 则整组替换）
     */
    app.patch('/violations/:id', async (req) => {
        const {id} = req.params as { id: string };
        const body = req.body as Partial<{
            confidence: number | null;
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
                confidence: body.confidence ?? undefined,
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
            // 复合主键重复（已收藏），可忽略
            if (e?.code !== 'P2002') throw e;
        }
        reply.code(201).send({ok: true});
    });

    /**
     * DELETE /api/violations/:id/bookmark?userId=USR001
     * 无 token 版本：从 query 读取 userId（为了匹配你现有 client.del()）
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
     * 简单日统计：近 N 天每天的数量
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
