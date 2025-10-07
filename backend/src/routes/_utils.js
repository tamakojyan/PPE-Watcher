"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NOTIF_TYPES = exports.NOTIF_STATUS = exports.VIOLATION_TYPES = exports.VIOLATION_STATUS = void 0;
exports.getPagination = getPagination;
exports.toDate = toDate;
exports.parseSort = parseSort;
exports.toEnum = toEnum;
exports.generateId = generateId;
const date_fns_1 = require("date-fns");
// pagination: support (?page=1&pageSize=20) or (?skip=0&take=20)
function getPagination(req) {
    const q = req.query;
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
function toDate(v) {
    if (typeof v !== 'string')
        return undefined;
    const d = new Date(v);
    return isNaN(d.getTime()) ? undefined : d;
}
// "ts:desc,confidence:asc" -> Prisma orderBy[]
/**
 * Parse sort string like "field:asc,other:desc" into Prisma orderBy input
 * @param sort string from query
 * @param allowed list of allowed fields
 */
function parseSort(sort, allowed) {
    if (!sort)
        return undefined;
    const orders = [];
    for (const token of sort.split(',')) {
        const [field, dir] = token.split(':');
        if (!field || !dir)
            continue;
        if (!allowed.includes(field))
            continue;
        if (dir !== 'asc' && dir !== 'desc')
            continue;
        orders.push({ [field]: dir });
    }
    return orders.length > 0 ? orders : undefined;
}
// narrow string into union literal
function toEnum(v, accepted) {
    if (typeof v !== 'string')
        return undefined;
    return accepted.includes(v) ? v : undefined;
}
/**
 * Generate a custom ID with business prefix + formatted timestamp
 * @param prefix Business prefix like "VIO", "NTF", "USR"
 * @returns string ID, e.g. VIO20250927223015
 */
function generateId(prefix) {
    const ts = (0, date_fns_1.format)(new Date(), "yyyyMMddHHmmss");
    return `${prefix}${ts}`;
}
// literals aligned with schema enums
exports.VIOLATION_STATUS = ['open', 'resolved'];
exports.VIOLATION_TYPES = ['no_helmet', 'no_mask', 'no_vest', 'no_gloves', 'no_goggles', 'no_boots'];
exports.NOTIF_STATUS = ['read', 'unread'];
exports.NOTIF_TYPES = ['violation', 'resolved'];
