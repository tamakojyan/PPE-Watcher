// src/routes/auth.ts
import type { FastifyInstance } from "fastify";
import { prisma } from "@lib/prisma";

export default async function authRoutes(app: FastifyInstance) {
    app.post("/login", async (req, reply) => {
        const { id, password } = req.body as { id: string; password: string };

        // Find user
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user || user.password !== password) {
            return reply.code(401).send({ message: "Invalid credentials" });
        }

        // Update last login time
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });

        // Sign JWT (payload: { id: user.id })
        const token = await reply.jwtSign({ id: user.id });

        return { token };
    });
}