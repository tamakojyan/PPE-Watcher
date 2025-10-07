"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = bookmarkRoutes;
const prisma_1 = require("@lib/prisma");
const _utils_1 = require("./_utils");
const _utils_2 = require("./_utils");
async function bookmarkRoutes(app) {
    /**
     * GET /me/bookmarks
     * Return paginated bookmarks of the current user.
     * Supports filters (status, type, date range, keyword) and sorting.
     */
    app.get('/me/bookmarks', { preValidation: [app.authenticate] }, async (req) => {
        const { skip, take } = (0, _utils_1.getPagination)(req);
        const q = req.query;
        const userId = req.user.id;
        // --- Parse filters ---
        const keyword = q.keyword?.trim();
        const from = q.from ? new Date(Number(q.from)) : undefined;
        const to = q.to ? new Date(Number(q.to)) : undefined;
        const status = (0, _utils_1.toEnum)(q.status, _utils_2.VIOLATION_STATUS);
        const kind = (0, _utils_1.toEnum)(q.type ?? q.kind, _utils_2.VIOLATION_TYPES);
        // --- Build where clause ---
        const where = {
            userId,
            violation: {},
        };
        const violationFilters = [];
        if (from || to) {
            violationFilters.push({
                ts: {
                    ...(from ? { gte: from } : {}),
                    ...(to ? { lte: to } : {}),
                },
            });
        }
        if (status) {
            violationFilters.push({ status });
        }
        if (kind) {
            violationFilters.push({ kinds: { some: { type: kind } } });
        }
        if (keyword) {
            if (keyword.startsWith('VIO')) {
                violationFilters.push({ id: keyword });
            }
            else {
                const statusFromKeyword = (0, _utils_1.toEnum)(keyword.toLowerCase(), _utils_2.VIOLATION_STATUS);
                const kindFromKeyword = (0, _utils_1.toEnum)(keyword, _utils_2.VIOLATION_TYPES);
                violationFilters.push({
                    OR: [
                        { snapshotUrl: { contains: keyword } },
                        { handler: { contains: keyword } },
                        statusFromKeyword ? { status: statusFromKeyword } : undefined,
                        kindFromKeyword ? { kinds: { some: { type: kindFromKeyword } } } : undefined,
                    ].filter(Boolean),
                });
            }
        }
        if (violationFilters.length > 0) {
            where.violation = { AND: violationFilters };
        }
        // --- Sorting (default: newest first) ---
        const orderBy = (0, _utils_1.parseSort)(req.query?.sort, ['createdAt']) || [{ createdAt: 'desc' }];
        app.log.info({ where, orderBy, skip, take }, '📌 Prisma query config');
        app.log.info({ where, orderBy, skip, take }, '📌 Prisma query config');
        // --- Run queries ---
        const [items, total] = await Promise.all([
            prisma_1.prisma.userViolationBookmark.findMany({
                where,
                skip,
                take,
                orderBy,
                include: {
                    violation: { include: { kinds: true } },
                },
            }),
            prisma_1.prisma.userViolationBookmark.count({ where }),
        ]);
        return { items, total, skip, take, orderBy };
    });
    /**
     * GET /me/bookmark-ids
     * Return only violation IDs bookmarked by the user.
     * Useful for global "isBookmarked" checks.
     */
    app.get('/me/bookmark-ids', { preValidation: [app.authenticate] }, async (req) => {
        const userId = req.user.id;
        const rows = await prisma_1.prisma.userViolationBookmark.findMany({
            where: { userId },
            select: { violationId: true },
            orderBy: { createdAt: 'desc' },
        });
        return rows.map((r) => r.violationId);
    });
    /**
     * POST /bookmarks/:violationId
     * Add a bookmark. Idempotent: if exists, still return ok.
     */
    app.post('/bookmarks/:violationId', { preValidation: [app.authenticate] }, async (req, reply) => {
        const userId = req.user.id;
        const { violationId } = req.params;
        try {
            await prisma_1.prisma.userViolationBookmark.create({
                data: { userId, violationId },
            });
            return reply.code(201).send({ ok: true });
        }
        catch (e) {
            if (e?.code === 'P2002') {
                return reply.send({ ok: true }); // already exists
            }
            throw e;
        }
    });
    /**
     * DELETE /bookmarks/:violationId
     * Remove a bookmark. Idempotent: if not found, still return 204.
     */
    app.delete('/bookmarks/:violationId', { preValidation: [app.authenticate] }, async (req, reply) => {
        const userId = req.user.id;
        const { violationId } = req.params;
        try {
            await prisma_1.prisma.userViolationBookmark.delete({
                where: { userId_violationId: { userId, violationId } },
            });
        }
        catch (e) {
            if (e?.code !== 'P2025')
                throw e;
        }
        return reply.code(204).send();
    });
}
