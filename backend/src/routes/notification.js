"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = notificationRoutes;
const prisma_1 = require("@lib/prisma");
const _utils_1 = require("./_utils");
async function notificationRoutes(app) {
    /**
     * GET /api/notifications
     * Query: userId, status, type, from, to, page/pageSize | skip/take, sort
     * sort whitelist: ['createdAt','status','id']
     */
    app.get('/notifications', async (req) => {
        const { skip, take } = (0, _utils_1.getPagination)(req);
        const q = req.query;
        const keyword = q.keyword?.trim();
        const from = q.from ? new Date(Number(q.from)) : undefined;
        const to = q.to ? new Date(Number(q.to)) : undefined;
        const status = (0, _utils_1.toEnum)(q.status, _utils_1.NOTIF_STATUS); // handled | unhandled
        const type = (0, _utils_1.toEnum)(q.type, _utils_1.NOTIF_TYPES); // violation | resolved
        const userId = q.userId;
        const where = { AND: [] };
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
        if (status)
            where.AND.push({ status });
        // Type filter
        if (type)
            where.AND.push({ type });
        // User filter
        if (userId)
            where.AND.push({ userId });
        // Keyword filter
        if (keyword) {
            const lower = keyword.toLowerCase();
            const statusFromKeyword = lower === 'handled' || lower === 'unhandled' ? lower : undefined;
            const typeFromKeyword = lower === 'violation' || lower === 'resolved' ? lower : undefined;
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
        if (where.AND.length === 0)
            delete where.AND;
        const orderBy = (0, _utils_1.parseSort)(q.sort, ['createdAt', 'status', 'id']) ||
            [{ createdAt: 'desc' }];
        req.log.info({ keyword, where, skip, take, orderBy }, 'notification query');
        const [items, total] = await Promise.all([
            prisma_1.prisma.notification.findMany({
                where,
                skip,
                take,
                orderBy,
                include: { violation: { include: { kinds: true } }, user: true },
            }),
            prisma_1.prisma.notification.count({ where }),
        ]);
        return { items, total, skip, take, orderBy };
    });
    // mark single as read
    app.patch('/notifications/:id/read', async (req) => {
        const { id } = req.params;
        return prisma_1.prisma.notification.update({
            where: { id },
            data: { status: 'handled', readAt: new Date() },
        });
    });
    // mark all unread as read for a user
    app.post('/notifications/read-all', async (req) => {
        const { userId } = req.body;
        const r = await prisma_1.prisma.notification.updateMany({
            where: { userId, status: 'unhandled' },
            data: { status: 'handled', readAt: new Date() },
        });
        return { updated: r.count };
    });
    // PATCH /notifications/:id  -> update status/note
    app.patch('/notifications/:id', { preValidation: [app.authenticate] }, async (req, reply) => {
        const { id } = req.params;
        const { status, note } = req.body;
        if (!status && note === undefined) {
            return reply.code(400).send({ message: 'Nothing to update' });
        }
        const user = req.user;
        const userId = user?.id ?? null;
        const data = {};
        if (status) {
            data.status = status;
            if (status === 'handled') {
                data.readAt = new Date();
            }
            else {
                data.readAt = null;
            }
        }
        if (note !== undefined)
            data.note = note;
        if (userId)
            data.userId = userId; //
        const updated = await prisma_1.prisma.notification.update({
            where: { id },
            data,
            include: { violation: { include: { kinds: true } }, user: true }, //
        });
        return updated;
    });
    app.delete('/notifications/:id', async (req, reply) => {
        const { id } = req.params;
        await prisma_1.prisma.notification.delete({ where: { id } });
        reply.code(204).send();
    });
}
