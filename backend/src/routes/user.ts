    // src/routes/user.ts
    import type { FastifyInstance,FastifyRequest } from 'fastify';
    import { prisma } from '@lib/prisma';
    import { getPagination, parseSort } from './_utils';

    type AuthedReq = FastifyRequest & { user: { id: string } };


    export default async function userRoutes(app: FastifyInstance) {
        /**
         * Register an authentication decorator
         * Usage: { preValidation: [app.authenticate] }
         */
        app.decorate('authenticate', async (req: any, reply: any) => {
            try {
                await req.jwtVerify();
            } catch (err) {
                reply.code(401).send({ message: 'Unauthorized' });
            }
        });

        /**
         * GET /users
         * List users with pagination, search, and sorting
         */
        app.get('/users', async (req) => {
            const { skip, take } = getPagination(req);
            const q = (req.query as any)?.q as string | undefined;

            const where = q
                ? {
                    OR: [
                        { id: { contains: q } },
                        { email: { contains: q, mode: 'insensitive' } },
                    ],
                }
                : {};

            const orderBy =
                parseSort((req.query as any)?.sort, ['createdAt', 'id', 'email']) ||
                [{ createdAt: 'desc' as const }];

            const [items, total] = await Promise.all([
                prisma.user.findMany({ where, skip, take, orderBy }),
                prisma.user.count({ where }),
            ]);

            return { items, total, skip, take, orderBy };
        });

        /**
         * GET /users/:id
         * Get details of a single user by ID
         */
        app.get('/users/:id', async (req) => {
            const { id } = req.params as { id: string };
            return prisma.user.findUniqueOrThrow({ where: { id } });
        });

        /**
         * POST /users
         * Create a new user
         */
        app.post('/users', async (req, reply) => {
            const { id, email, password } = req.body as {
                id: string;
                email: string;
                password: string;
            };
            try {
                const created = await prisma.user.create({ data: { id, email, password } });
                return reply.code(201).send(created);
            } catch (e: any) {
                if (e?.code === 'P2002') return reply.code(409).send({ message: 'Email already exists' });
                throw e;
            }
        });

        /**
         * PATCH /users/:id
         * Update user details
         */
        app.patch('/users/:id', async (req, reply) => {
            const { id } = req.params as { id: string };
            const { email, password } = req.body as Partial<{ email: string; password: string }>;
            try {
                const updated = await prisma.user.update({
                    where: { id },
                    data: { email: email ?? undefined, password: password ?? undefined },
                });
                return reply.send(updated);
            } catch (e: any) {
                if (e?.code === 'P2002') return reply.code(409).send({ message: 'Email already exists' });
                if (e?.code === 'P2025') return reply.code(404).send({ message: 'User not found' });
                throw e;
            }
        });

        /**
         * DELETE /users/:id
         * Delete a user by ID
         */
        app.delete('/users/:id', async (req, reply) => {
            const { id } = req.params as { id: string };
            try {
                await prisma.user.delete({ where: { id } });
                return reply.code(204).send();
            } catch (e: any) {
                if (e?.code === 'P2025') return reply.code(404).send({ message: 'User not found' });
                throw e;
            }
        });


        app.get('/me/security', { preValidation: [app.authenticate] },async (req, reply) => {
            const userId = (req as AuthedReq).user.id;
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { lastLoginAt: true, lastPasswordChangeAt: true },
            });
            return user;
        });

    // Change password
        app.post('/me/change-password', { preValidation: [app.authenticate] },async (req, reply) => {
            const userId = (req as AuthedReq).user.id;
            const { currentPassword, newPassword } = req.body as {
                currentPassword: string;
                newPassword: string;
            };

            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user || user.password !== currentPassword) {
                return reply.code(400).send({ message: 'Invalid current password' });
            }

            await prisma.user.update({
                where: { id: userId },
                data: {
                    password: newPassword,
                    lastPasswordChangeAt: new Date(),
                },
            });

            return { success: true };
        });
    }
