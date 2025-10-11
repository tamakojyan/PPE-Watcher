import type { FastifyInstance } from 'fastify';
import { prisma } from '@lib/prisma';
import {Prisma} from '@prisma/client';
import { getPagination, toEnum, parseSort, NOTIF_STATUS, NOTIF_TYPES } from './_utils';

export default async function notificationRoutes(app: FastifyInstance) {
    /**
     * GET /api/notifications
     * Query: userId, status, type, from, to, page/pageSize | skip/take, sort
     * sort whitelist: ['createdAt','status','id']
     */
    app.get('/notifications', async (req) => {
        const { skip, take } = getPagination(req);
        const q = req.query as any;

        const keyword = (q.keyword as string | undefined)?.trim();
        const from = q.from ? new Date(Number(q.from)) : undefined;
        const to = q.to ? new Date(Number(q.to)) : undefined;
        const status = toEnum(q.status, NOTIF_STATUS);   // handled | unhandled
        const type = toEnum(q.type, NOTIF_TYPES);        // violation | resolved
        const userId = q.userId as string | undefined;

        const where: any = { AND: [] };

        // Time filter
        if (from || to) {
            where.AND.push({
                createdAt: {
                    ...(from ? { gte: from } : {}),
                    ...(to ? { lte: to } : {}),
                },
            });
        }

        // Status filter
        if (status) where.AND.push({ status });

        // Type filter
        if (type) where.AND.push({ type });

        // User filter
        if (userId) where.AND.push({ userId });

        // Keyword filter
        if (keyword) {
            const lower = keyword.toLowerCase();
            const statusFromKeyword =
                lower === 'handled' || lower === 'unhandled' ? (lower as typeof NOTIF_STATUS[number]) : undefined;
            const typeFromKeyword =
                lower === 'violation' || lower === 'resolved' ? (lower as typeof NOTIF_TYPES[number]) : undefined;

            where.AND.push({
                OR: [
                    // search by notification id
                    { id: { contains: keyword } },

                    // search by violation id
                    { violationId: { contains: keyword } },

                    // search message / note
                    { message: { contains: keyword } },
                    { note: { contains: keyword } },

                    // exact enum matches
                    statusFromKeyword ? { status: { equals: statusFromKeyword } } : undefined,
                    typeFromKeyword ? { type: { equals: typeFromKeyword } } : undefined,
                ].filter(Boolean),
            });
        }

        if (where.AND.length === 0) delete where.AND;

        const orderBy: Prisma.NotificationOrderByWithRelationInput[] =
            (parseSort(q.sort, ['createdAt', 'status', 'id']) as Prisma.NotificationOrderByWithRelationInput[]) ||
            [{ createdAt: 'desc' }];

        req.log.info({ keyword, where, skip, take, orderBy }, 'notification query');

        const [items, total] = await Promise.all([
            prisma.notification.findMany({
                where,
                skip,
                take,
                orderBy,
                include: { violation: { include: { kinds: true } }, user: true },
            }),
            prisma.notification.count({ where }),
        ]);

        return { items, total, skip, take, orderBy };
    });



    // mark single as read
    app.patch('/notifications/:id/read', async (req) => {
        const { id } = req.params as { id: string };
        return prisma.notification.update({
            where: { id },
            data: { status: 'handled', readAt: new Date() },
        });
    });

    // mark all unread as read for a user
    app.post('/notifications/read-all', async (req) => {
        const { userId } = req.body as { userId: string };
        const r = await prisma.notification.updateMany({
            where: { userId, status: 'unhandled' },
            data: { status: 'handled', readAt: new Date() },
        });
        return { updated: r.count };
    });
// PATCH /notifications/:id  -> update status/note
    app.patch('/notifications/:id', { preValidation: [app.authenticate] }, async (req, reply) => {
        const { id } = req.params as { id: string };
        const { status, note } = req.body as { status?: 'handled' | 'unhandled'; note?: string };

        if (!status && note === undefined) {
            return reply.code(400).send({ message: 'Nothing to update' });
        }

        const user = (req as any).user;
        const userId = user?.id ?? null;

        const data: any = {};
        if (status) {
            data.status = status;
            if (status === 'handled') {
                data.readAt = new Date();
            } else {
                data.readAt = null;
            }
        }
        if (note !== undefined) data.note = note;
        if (userId) data.userId = userId; //

        const updated = await prisma.notification.update({
            where: { id },
            data,
            include: {violation: { include: { kinds: true } }, user: true }, //
        });

        return updated;
    });

}
