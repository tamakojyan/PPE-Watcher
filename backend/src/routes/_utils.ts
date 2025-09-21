import type { FastifyRequest } from 'fastify';
import {Prisma} from '@prisma/client';

// pagination: support (?page=1&pageSize=20) or (?skip=0&take=20)
export function getPagination(req: FastifyRequest) {
    const q = req.query as any;
    const page = Math.max(Number(q?.page ?? 0), 0);
    const pageSize = Math.min(Math.max(Number(q?.pageSize ?? 0), 0), 100);

    let skip = Number(q?.skip ?? 0);
    let take = Number(q?.take ?? 0);

    if (pageSize) {
        return { skip: page * pageSize, take: pageSize };
    }
    // fallback to skip/take
    return { skip: Math.max(skip, 0), take: Math.min(take || 20, 100) };
}

export function toDate(v?: unknown) {
    if (typeof v !== 'string') return undefined;
    const d = new Date(v);
    return isNaN(d.getTime()) ? undefined : d;
}

// "ts:desc,confidence:asc" -> Prisma orderBy[]
export function parseSort(
    sort: string | undefined,
    allowed: string[]
): Prisma.UserViolationBookmarkOrderByWithRelationInput[] | undefined {
    if (!sort) return undefined;

    const [field, dir] = sort.split(':');
    if (!allowed.includes(field)) return undefined;

    if (field.startsWith('violation.')) {
        // nested sort
        const nestedField = field.replace('violation.', '');
        return [{ violation: { [nestedField]: dir === 'asc' ? 'asc' : 'desc' } }];
    }

    // top-level sort
    return [{ [field]: dir === 'asc' ? 'asc' : 'desc' } as any];
}

// narrow string into union literal
export function toEnum<T extends readonly string[]>(v: unknown, accepted: T): T[number] | undefined {
    if (typeof v !== 'string') return undefined;
    return (accepted as readonly string[]).includes(v) ? (v as T[number]) : undefined;
}

// literals aligned with schema enums
export const VIOLATION_STATUS = ['open', 'resolved'] as const;
export const VIOLATION_TYPES  = ['no_helmet', 'no_mask', 'no_vest', 'no_gloves'] as const;
export const NOTIF_STATUS = ['read', 'unread'] as const;
export const NOTIF_TYPES  = ['violation', 'resolved'] as const;