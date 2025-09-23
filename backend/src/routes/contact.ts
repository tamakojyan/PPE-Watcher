import type { FastifyInstance } from 'fastify';
import { prisma } from '@lib/prisma';

export default async function contactRoutes(app: FastifyInstance) {
    /**
     * GET /contacts
     * List all contacts
     */
    app.get('/contacts', async () => {
        return prisma.contact.findMany({ orderBy: { createdAt: 'desc' } });
    });

    /**
     * POST /contacts
     * Add a new contact
     */
    app.post('/contacts', async (req, reply) => {
        const { id, name, email, phone } = req.body as {
            id: string;
            name: string;
            email: string;
            phone: string;
        };
        const created = await prisma.contact.create({
            data: { id, name, email, phone },
        });
        return reply.code(201).send(created);
    });

    /**
     * PATCH /contacts/:id
     * Update an existing contact
     * Prisma will automatically update `updatedAt`
     */
    app.patch('/contacts/:id', async (req, reply) => {
        const { id } = req.params as { id: string };
        const { name, email, phone } = req.body as Partial<{
            name: string;
            email: string;
            phone: string;
        }>;

        try {
            const updated = await prisma.contact.update({
                where: { id },
                data: {
                    name: name ?? undefined,
                    email: email ?? undefined,
                    phone: phone ?? undefined,
                },
            });
            return reply.send(updated);
        } catch (e: any) {
            if (e?.code === 'P2025') {
                return reply.code(404).send({ message: 'Contact not found' });
            }
            throw e;
        }
    });

    /**
     * DELETE /contacts/:id
     * Remove a contact
     */
    app.delete('/contacts/:id', async (req, reply) => {
        const { id } = req.params as { id: string };
        try {
            await prisma.contact.delete({ where: { id } });
            return reply.code(204).send();
        } catch (e: any) {
            if (e?.code === 'P2025') {
                return reply.code(404).send({ message: 'Contact not found' });
            }
            throw e;
        }
    });
}
