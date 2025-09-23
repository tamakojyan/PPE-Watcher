import { FastifyInstance } from 'fastify';
import { prisma } from '@lib/prisma';

export default async function configRoutes(app: FastifyInstance) {
    // Get all config
    app.get('/config', async () => {
        const rows = await prisma.systemConfig.findMany();
        const config: Record<string, any> = {};
        rows.forEach((r) => {
            try {
                config[r.key] = JSON.parse(r.value); // try parse JSON
            } catch {
                config[r.key] = r.value;
            }
        });
        return config;
    });

    // Update multiple configs
    app.post('/config', async (req, reply) => {
        const body = req.body as Record<string, any>;

        await Promise.all(
            Object.entries(body).map(([key, value]) =>
                prisma.systemConfig.upsert({
                    where: { key },
                    update: { value: typeof value === 'string' ? value : JSON.stringify(value) },
                    create: { key, value: typeof value === 'string' ? value : JSON.stringify(value) },
                })
            )
        );

        return { success: true };
    });
}
