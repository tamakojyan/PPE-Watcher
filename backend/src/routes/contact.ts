import type { FastifyInstance } from 'fastify';
import { prisma } from '@lib/prisma';
import { getPagination, parseSort, toDate } from './_utils';

export default async function contactRoutes(app: FastifyInstance) {
    /**
     * GET /api/contacts
     * Query: q, from, to, page/pageSize | skip/take, sort
     * sort whitelist: ['createdAt','updatedAt','name','id']
     */
    app.get('/contacts', async (req) => {
        const { skip, take } = getPagination(req);
        const query = req.query as any;

        const q = (query?.q as string | undefined)?.trim();
        const from = toDate(query?.from);
        const to = toDate(query?.to);

        const where: any = {};
        if (q) {
            where.OR = [
                { id: { contains: q } },
                { name: { contains: q, mode: 'insensitive' } },
                { email: { contains: q, mode: 'insensitive' } },
                { phone: { contains: q } },
            ];
        }
        if (from || to) where.createdAt = { gte: from, lte: to };

        const orderBy =
            parseSort(query?.sort, ['createdAt', 'updatedAt', 'name', 'id']) ||
            [{ createdAt: 'desc' as const }];

        const [items, total] = await Promise.all([
            prisma.contact.findMany({ where, skip, take, orderBy }),
            prisma.contact.count({ where }),
        ]);
        return { items, total, skip, take, orderBy };
    });

    app.get('/contacts/:id', async (req) => {
        const { id } = req.params as { id: string };
        return prisma.contact.findUniqueOrThrow({ where: { id } });
    });

    app.post('/contacts', async (req, reply) => {
        const { id, name, email, phone } = req.body as {
            id: string; name: string; email?: string | null; phone?: string | null;
        };
        const created = await prisma.contact.create({ data: { id, name, email: email ?? null, phone: phone ?? null } });
        reply.code(201).send(created);
    });

    app.patch('/contacts/:id', async (req) => {
        const { id } = req.params as { id: string };
        const { name, email, phone } = req.body as Partial<{ name: string; email: string | null; phone: string | null }>;
        return prisma.contact.update({ where: { id }, data: { name, email, phone } });
    });

    app.delete('/contacts/:id', async (req, reply) => {
        const { id } = req.params as { id: string };
        await prisma.contact.delete({ where: { id } });
        reply.code(204).send();
    });
}
