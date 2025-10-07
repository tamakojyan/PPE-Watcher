"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = authRoutes;
const prisma_1 = require("@lib/prisma");
async function authRoutes(app) {
    app.post("/login", async (req, reply) => {
        const { id, password } = req.body;
        // Find user
        const user = await prisma_1.prisma.user.findUnique({ where: { id } });
        if (!user || user.password !== password) {
            return reply.code(401).send({ message: "Invalid credentials" });
        }
        // Update last login time
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        // Sign JWT (payload: { id: user.id })
        const token = await reply.jwtSign({ id: user.id });
        return { token };
    });
}
