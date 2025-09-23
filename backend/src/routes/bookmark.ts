// src/routes/bookmark.ts
import type { FastifyInstance, FastifyRequest } from 'fastify';
import { prisma } from '@lib/prisma';
import { Prisma } from '@prisma/client'
import { getPagination, toEnum, parseSort } from './_utils';
import { VIOLATION_TYPES, VIOLATION_STATUS } from './_utils';

type AuthedReq = FastifyRequest & { user: { id: string } };

export default async function bookmarkRoutes(app: FastifyInstance) {
    /**
     * GET /me/bookmarks
     * Return paginated bookmarks of the current user.
     * Supports filters (status, type, date range, keyword) and sorting.
     */
    app.get(
        '/me/bookmarks',
        { preValidation: [app.authenticate] },
        async (req) => {
            const { skip, take } = getPagination(req);
            const q = req.query as any;
            const userId = (req as AuthedReq).user.id;

            // --- Parse filters ---
            const keyword = (q.keyword as string | undefined)?.trim();
            const from = q.from ? new Date(Number(q.from)) : undefined;
            const to = q.to ? new Date(Number(q.to)) : undefined;
            const status = toEnum(q.status, VIOLATION_STATUS);
            const kind = toEnum(q.type ?? q.kind, VIOLATION_TYPES);

            // --- Build where clause ---
            const where: Prisma.UserViolationBookmarkWhereInput = {
                userId,
                violation: {},
            };

            const violationFilters: Prisma.ViolationWhereInput[] = [];

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
                } else {
                    const statusFromKeyword = toEnum(keyword.toLowerCase(), VIOLATION_STATUS);
                    const kindFromKeyword = toEnum(keyword, VIOLATION_TYPES);

                    violationFilters.push({
                        OR: [
                            { snapshotUrl: { contains: keyword } },
                            { handler: { contains: keyword } },
                            statusFromKeyword ? { status: statusFromKeyword } : undefined,
                            kindFromKeyword ? { kinds: { some: { type: kindFromKeyword } } } : undefined,
                        ].filter(Boolean) as Prisma.ViolationWhereInput[],
                    });
                }
            }

            if (violationFilters.length > 0) {
                where.violation = { AND: violationFilters };
            }

            // --- Sorting (default: newest first) ---
            const orderBy =
                parseSort<Prisma.UserViolationBookmarkOrderByWithRelationInput>(
                    (req.query as any)?.sort,
                    ['createdAt']
                ) || [{ createdAt: 'desc' }];

            app.log.info({ where, orderBy, skip, take }, '📌 Prisma query config');

            app.log.info({ where, orderBy, skip, take }, '📌 Prisma query config');

            // --- Run queries ---
            const [items, total] = await Promise.all([
                prisma.userViolationBookmark.findMany({
                    where,
                    skip,
                    take,
                    orderBy,
                    include: {
                        violation: { include: { kinds: true } },
                    },
                }),
                prisma.userViolationBookmark.count({ where }),
            ]);

            return { items, total, skip, take, orderBy };
        }
    );

    /**
     * GET /me/bookmark-ids
     * Return only violation IDs bookmarked by the user.
     * Useful for global "isBookmarked" checks.
     */
    app.get(
        '/me/bookmark-ids',
        { preValidation: [app.authenticate] },
        async (req) => {
            const userId = (req as AuthedReq).user.id;

            const rows = await prisma.userViolationBookmark.findMany({
                where: { userId },
                select: { violationId: true },
                orderBy: { createdAt: 'desc' },
            });

            return rows.map((r) => r.violationId);
        }
    );

    /**
     * POST /bookmarks/:violationId
     * Add a bookmark. Idempotent: if exists, still return ok.
     */
    app.post(
        '/bookmarks/:violationId',
        { preValidation: [app.authenticate] },
        async (req, reply) => {
            const userId = (req as AuthedReq).user.id;
            const { violationId } = req.params as { violationId: string };

            try {
                await prisma.userViolationBookmark.create({
                    data: { userId, violationId },
                });
                return reply.code(201).send({ ok: true });
            } catch (e: any) {
                if (e?.code === 'P2002') {
                    return reply.send({ ok: true }); // already exists
                }
                throw e;
            }
        }
    );

    /**
     * DELETE /bookmarks/:violationId
     * Remove a bookmark. Idempotent: if not found, still return 204.
     */
    app.delete(
        '/bookmarks/:violationId',
        { preValidation: [app.authenticate] },
        async (req, reply) => {
            const userId = (req as AuthedReq).user.id;
            const { violationId } = req.params as { violationId: string };

            try {
                await prisma.userViolationBookmark.delete({
                    where: { userId_violationId: { userId, violationId } },
                });
            } catch (e: any) {
                if (e?.code !== 'P2025') throw e;
            }
            return reply.code(204).send();
        }
    );
}
