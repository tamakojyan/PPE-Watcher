"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = contactRoutes;
const prisma_1 = require("@lib/prisma");
async function contactRoutes(app) {
    /**
     * GET /contacts
     * List all contacts
     */
    app.get('/contacts', async () => {
        return prisma_1.prisma.contact.findMany({ orderBy: { createdAt: 'desc' } });
    });
    /**
     * POST /contacts
     * Add a new contact
     */
    app.post('/contacts', async (req, reply) => {
        const { id, name, email, phone } = req.body;
        const created = await prisma_1.prisma.contact.create({
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
        const { id } = req.params;
        const { name, email, phone } = req.body;
        try {
            const updated = await prisma_1.prisma.contact.update({
                where: { id },
                data: {
                    name: name ?? undefined,
                    email: email ?? undefined,
                    phone: phone ?? undefined,
                },
            });
            return reply.send(updated);
        }
        catch (e) {
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
        const { id } = req.params;
        try {
            await prisma_1.prisma.contact.delete({ where: { id } });
            return reply.code(204).send();
        }
        catch (e) {
            if (e?.code === 'P2025') {
                return reply.code(404).send({ message: 'Contact not found' });
            }
            throw e;
        }
    });
}
