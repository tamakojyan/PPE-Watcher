"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = configRoutes;
const prisma_1 = require("@lib/prisma");
async function configRoutes(app) {
    // Get all config
    app.get('/config', async () => {
        const rows = await prisma_1.prisma.systemConfig.findMany();
        const config = {};
        rows.forEach((r) => {
            try {
                config[r.key] = JSON.parse(r.value); // try parse JSON
            }
            catch {
                config[r.key] = r.value;
            }
        });
        return config;
    });
    // Update multiple configs
    app.post('/config', async (req, reply) => {
        const body = req.body;
        await Promise.all(Object.entries(body).map(([key, value]) => prisma_1.prisma.systemConfig.upsert({
            where: { key },
            update: { value: typeof value === 'string' ? value : JSON.stringify(value) },
            create: { key, value: typeof value === 'string' ? value : JSON.stringify(value) },
        })));
        return { success: true };
    });
}
