import type { FastifyRequest } from 'fastify';
import {Prisma} from '@prisma/client';
import { format } from "date-fns";

// pagination: support (?page=1&pageSize=20) or (?skip=0&take=20)
export function getPagination(req: FastifyRequest) {
    const q = req.query as any;
    const page = Math.max(Number(q?.page ?? 0), 0);
    const pageSize = Math.min(Math.max(Number(q?.pageSize ?? 0), 0), 1000);

    let skip = Number(q?.skip ?? 0);
    let take = Number(q?.take ?? 0);

    if (pageSize) {
        return { skip: page * pageSize, take: pageSize };
    }
    // fallback to skip/take
    return { skip: Math.max(skip, 0), take: Math.min(take || 20, 1000) };
}

export function toDate(v?: unknown) {
    if (typeof v !== 'string') return undefined;
    const d = new Date(v);
    return isNaN(d.getTime()) ? undefined : d;
}

// "ts:desc,confidence:asc" -> Prisma orderBy[]
/**
 * Parse sort string like "field:asc,other:desc" into Prisma orderBy input
 * @param sort string from query
 * @param allowed list of allowed fields
 */
export function parseSort<T>(
    sort: string | undefined,
    allowed: string[]
): T[] | undefined {
    if (!sort) return undefined;

    const orders: T[] = [];

    for (const token of sort.split(',')) {
        const [field, dir] = token.split(':');
        if (!field || !dir) continue;

        if (!allowed.includes(field)) continue;
        if (dir !== 'asc' && dir !== 'desc') continue;

        orders.push({ [field]: dir } as unknown as T);
    }

    return orders.length > 0 ? orders : undefined;
}

// narrow string into union literal
export function toEnum<T extends readonly string[]>(v: unknown, accepted: T): T[number] | undefined {
    if (typeof v !== 'string') return undefined;
    return (accepted as readonly string[]).includes(v) ? (v as T[number]) : undefined;
}

/**
 * Generate a custom ID with business prefix + formatted timestamp
 * @param prefix Business prefix like "VIO", "NTF", "USR"
 * @returns string ID, e.g. VIO20250927223015
 */
export function generateId(prefix: string): string {
    const ts = format(new Date(), "yyyyMMddHHmmss");
    return `${prefix}${ts}`;
}

// literals aligned with schema enums
export const VIOLATION_STATUS = ['open', 'resolved'] as const;
export const VIOLATION_TYPES  = ['no_helmet', 'no_mask', 'no_vest', 'no_gloves','no_goggles','no_boots'] as const;
export type ViolationType = typeof VIOLATION_TYPES[number]
export const NOTIF_STATUS = ['read', 'unread'] as const;
export const NOTIF_TYPES  = ['violation', 'resolved'] as const;