// prisma/seedExtra.ts
import { PrismaClient, ViolationStatus } from '@prisma/client';
const prisma = new PrismaClient();

const pad = (n: number, w = 3) => String(n).padStart(w, '0');
const id = (prefix: string, n: number) => `${prefix}${pad(n)}`;

async function main() {
    // 当前已有多少 violations
    const existingViolations = await prisma.violation.count();

    // 配置：今天插 12 条，昨天插 8 条
    const TODAY_COUNT = 12;
    const YESTERDAY_COUNT = 8;
    const total = TODAY_COUNT + YESTERDAY_COUNT;

    const now = new Date();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const newViolations = Array.from({ length: total }, (_, i) => {
        const idx = existingViolations + i + 1;

        // 前 12 条今天，后 8 条昨天
        const ts = i < TODAY_COUNT ? now : yesterday;

        return {
            id: id('VIO', idx),
            ts,
            snapshotUrl: `https://picsum.photos/seed/v${idx}/800/450`,
            status: Math.random() < 0.5 ? ViolationStatus.resolved : ViolationStatus.open,
            handler: 'system',
            confidence: Number((0.7 + Math.random() * 0.3).toFixed(2)),
        };
    });

    await prisma.violation.createMany({ data: newViolations });

    console.log(
        `✅ SeedExtra done: Added ${total} violations -> Today=${TODAY_COUNT}, Yesterday=${YESTERDAY_COUNT}, Trend should be ${TODAY_COUNT - YESTERDAY_COUNT}`
    );
}

main()
    .catch((e) => {
        console.error('SeedExtra failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
