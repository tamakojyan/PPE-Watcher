// prisma/seed.ts
import {
    PrismaClient,
    NotificationStatus,
    NotificationType,
    ViolationStatus,
    ViolationType,
} from '@prisma/client';

const prisma = new PrismaClient();

// ---------- helpers ----------
const pad = (n: number, w = 3) => String(n).padStart(w, '0');
const id = (prefix: string, n: number) => `${prefix}${pad(n)}`;
const randInt = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;
const choice = <T,>(arr: T[]) => arr[randInt(0, arr.length - 1)];
const sample = <T,>(arr: T[], k: number) => {
    const copy = [...arr];
    const out: T[] = [];
    for (let i = 0; i < k && copy.length; i++) {
        const idx = randInt(0, copy.length - 1);
        out.push(copy[idx]);
        copy.splice(idx, 1);
    }
    return out;
};

const minsAgo = (m: number) => new Date(Date.now() - m * 60 * 1000);
const hoursAgo = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000);

async function main() {
    // --- 0) wipe (FK-safe order) ---
    await prisma.userViolationBookmark.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.violationKind.deleteMany({});
    await prisma.violation.deleteMany({});
    await prisma.contact.deleteMany({});
    await prisma.user.deleteMany({});

    // --- 1) Users (≥100) ---
    const N_USERS = 120;
    const users = Array.from({ length: N_USERS }, (_, i) => ({
        id: id('USR', i + 1),
        email: `user${pad(i + 1)}@example.com`,
        password: 'pass123',
    }));
    await prisma.user.createMany({ data: users });

    // --- 2) Contacts (≥100) ---
    const N_CONTACTS = 120;
    const contacts = Array.from({ length: N_CONTACTS }, (_, i) => ({
        id: id('CON', i + 1),
        name: `Contact ${pad(i + 1)}`,
        email: `contact${pad(i + 1)}@factory.com`,
        phone: `1${randInt(3000000000, 3999999999)}`, // 简单伪号码
    }));
    await prisma.contact.createMany({ data: contacts });

    // --- 3) Violations (≥100) + 4) ViolationKind ---
    const N_VIOLATIONS = 150;
    const vioTypes = Object.values(ViolationType);
    const violations = Array.from({ length: N_VIOLATIONS }, (_, i) => {
        const minutesBack = randInt(10, 60 * 24 * 14); // 最近两周内
        const ts = minsAgo(minutesBack);
        const isResolved = Math.random() < 0.45; // ~45% 已解决
        const handler =
            isResolved ? `user${pad(randInt(1, N_USERS))}` : 'system';
        return {
            id: id('VIO', i + 1),
            ts,
            snapshotUrl: `https://picsum.photos/seed/v${i + 1}/800/450`,
            status: isResolved ? ViolationStatus.resolved : ViolationStatus.open,
            handler,
            confidence: Number((0.7 + Math.random() * 0.3).toFixed(2)),
        };
    });

    await prisma.violation.createMany({ data: violations });

    // join rows for kinds: each violation gets 1–3 kinds
    const kindsRows: { violationId: string; type: ViolationType }[] = [];
    for (const v of violations) {
        const k = randInt(1, 3);
        for (const t of sample(vioTypes, k)) {
            kindsRows.push({ violationId: v.id, type: t });
        }
    }
    await prisma.violationKind.createMany({ data: kindsRows });

    // --- 5) Notifications (≥100) ---
    // 每条 violation 至少 1 条 violation/unhandled；
    // 其中 ~60% 再补一条 resolved/handled。
    const notices: {
        id: string;
        type: NotificationType;
        status: NotificationStatus;
        createdAt: Date;
        readAt?: Date | null;
        violationId: string | null;
        userId: string | null;
        message: string | null;
        note: string | null;
        kind: ViolationType;
    }[] = [];

    let ntfSeq = 1;
    for (const v of violations) {
        // 把这条 violation 的 kinds 文本拼起来
        const vKinds = kindsRows
            .filter((k) => k.violationId === v.id)
            .map((k) => k.type);
        const kindsText = vKinds.join(', ') || choice(vioTypes);

        // 1) 触发通知（必有）
        notices.push({
            id: id('NTF', ntfSeq++),
            type: NotificationType.violation,
            status: NotificationStatus.unhandled,
            createdAt: v.ts,
            readAt: null,
            violationId: v.id,
            userId: choice(users).id,
            message: `Detected: ${kindsText}`,
            note: null,
            kind: Array.isArray(vKinds) && vKinds.length ? vKinds[0] : ViolationType.no_helmet,
        });

        // 2) 60% 的概率再生成解决通知
        if (Math.random() < 0.6) {
            const createdAt = new Date(v.ts.getTime() + randInt(5, 240) * 60 * 1000);
            const readAt = new Date(createdAt.getTime() + randInt(1, 15) * 60 * 1000);
            notices.push({
                id: id('NTF', ntfSeq++),
                type: NotificationType.resolved,
                status: NotificationStatus.handled,
                createdAt,
                readAt,
                violationId: v.id,
                userId: choice(users).id,
                message: `Resolved: ${kindsText}`,
                note: Math.random() < 0.4 ? 'Checked and closed.' : null,
                kind: Array.isArray(vKinds) && vKinds.length ? vKinds[0] : ViolationType.no_helmet,
            });
        }
    }

    await prisma.notification.createMany({ data: notices });

    // --- 6) Bookmarks（只放少量示例；如果不要可删掉本段） ---
    const N_BOOKMARKS = 10;
    const bmRows = Array.from({ length: N_BOOKMARKS }, (_, i) => ({
        userId: choice(users).id,
        violationId: violations[randInt(0, violations.length - 1)].id,
    }));
    await prisma.userViolationBookmark.createMany({ data: bmRows });

    console.log(
        `✅ Seed done: users=${users.length}, contacts=${contacts.length}, violations=${violations.length}, kinds=${kindsRows.length}, notifications=${notices.length}, bookmarks=${bmRows.length}`
    );
}

main()
    .catch((e) => {
        console.error('Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
