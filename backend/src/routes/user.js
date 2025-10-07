"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = userRoutes;
const prisma_1 = require("@lib/prisma");
const _utils_1 = require("./_utils");
async function userRoutes(app) {
    /**
     * Register an authentication decorator
     * Usage: { preValidation: [app.authenticate] }
     */
    app.decorate('authenticate', async (req, reply) => {
        try {
            await req.jwtVerify();
        }
        catch (err) {
            reply.code(401).send({ message: 'Unauthorized' });
        }
    });
    /**
     * GET /users
     * List users with pagination, search, and sorting
     */
    app.get('/users', async (req) => {
        const { skip, take } = (0, _utils_1.getPagination)(req);
        const q = req.query?.q;
        const where = q
            ? {
                OR: [
                    { id: { contains: q } },
                    { email: { contains: q, mode: 'insensitive' } },
                ],
            }
            : {};
        const orderBy = (0, _utils_1.parseSort)(req.query?.sort, ['createdAt', 'id', 'email']) ||
            [{ createdAt: 'desc' }];
        const [items, total] = await Promise.all([
            prisma_1.prisma.user.findMany({ where, skip, take, orderBy }),
            prisma_1.prisma.user.count({ where }),
        ]);
        return { items, total, skip, take, orderBy };
    });
    /**
     * GET /users/:id
     * Get details of a single user by ID
     */
    app.get('/users/:id', async (req) => {
        const { id } = req.params;
        return prisma_1.prisma.user.findUniqueOrThrow({ where: { id } });
    });
    /**
     * PATCH /users/:id
     * Update user details
     */
    app.patch('/users/:id', async (req, reply) => {
        const { id } = req.params;
        const { email, password } = req.body;
        try {
            const updated = await prisma_1.prisma.user.update({
                where: { id },
                data: { email: email ?? undefined, password: password ?? undefined },
            });
            return reply.send(updated);
        }
        catch (e) {
            if (e?.code === 'P2002')
                return reply.code(409).send({ message: 'Email already exists' });
            if (e?.code === 'P2025')
                return reply.code(404).send({ message: 'User not found' });
            throw e;
        }
    });
    /**
     * DELETE /users/:id
     * Delete a user by ID
     */
    app.delete('/users/:id', async (req, reply) => {
        const { id } = req.params;
        try {
            await prisma_1.prisma.user.delete({ where: { id } });
            return reply.code(204).send();
        }
        catch (e) {
            if (e?.code === 'P2025')
                return reply.code(404).send({ message: 'User not found' });
            throw e;
        }
    });
    app.get('/me/security', { preValidation: [app.authenticate] }, async (req, reply) => {
        const userId = req.user.id;
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: { lastLoginAt: true, lastPasswordChangeAt: true },
        });
        return user;
    });
    // Change password
    app.post('/me/change-password', { preValidation: [app.authenticate] }, async (req, reply) => {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;
        const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.password !== currentPassword) {
            return reply.code(400).send({ message: 'Invalid current password' });
        }
        await prisma_1.prisma.user.update({
            where: { id: userId },
            data: {
                password: newPassword,
                lastPasswordChangeAt: new Date(),
            },
        });
        return { success: true };
    });
}
