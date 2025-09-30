// src/api/client.ts
// Minimal data-only HTTP client with auth, JSON-only payloads, and small utilities.

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestOptions {
  /** Query object will be serialized to ?key=value */
  query?: Record<string, unknown>;
  /** Extra headers to merge (string dictionary only) */
  headers?: Record<string, string>;
  /** JSON-serializable body */
  body?: unknown;
}

/** Uniform error wrapper so callers can branch by HTTP status easily */
export class ApiError extends Error {
  constructor(
    public status: number,
    public url: string,
    public data?: unknown,
    message = `HTTP ${status}`
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Serialize query object to "?a=1&b=2". Supports array values. */
function toQuery(query?: Record<string, unknown>): string {
  if (!query) return '';
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null) continue;
    if (Array.isArray(v)) v.forEach((x) => sp.append(k, String(x)));
    else sp.append(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
}

/** Resolve base URL across Vite / CRA / default */
const host = window.location.hostname;
const DEFAULT_BASE: any =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE) ||
  (typeof process !== 'undefined' && process.env?.REACT_APP_API_BASE) ||
  `http://${host}:8080`;
/**
 * Create a minimal client.
 * @param baseURL API base URL
 * @param getToken Function returning bearer token (if any). Called per request.
 */
export function createClient(baseURL = DEFAULT_BASE, getToken?: () => string | null | undefined) {
  /**
   * Core request wrapper.
   * - JSON-only requests/responses
   * - Adds Authorization automatically if token exists
   * - Handles 204 / empty responses
   */
  async function request<T>(
    method: HttpMethod,
    path: string,
    opt: RequestOptions = {}
  ): Promise<T> {
    const url = `${baseURL}${path}${toQuery(opt.query)}`;

    // Use a plain string dictionary so we can index safely (fixes TS7053).

    const headers: Record<string, string> = {
      ...(opt.headers ?? {}),
    };

    // attach bearer token first
    const token = getToken?.() ?? null;
    if (token) headers.Authorization = `Bearer ${token}`;

    // only set Content-Type when there is a body
    const hasBody = opt.body !== undefined;
    if (hasBody && headers['Content-Type'] == null) {
      headers['Content-Type'] = 'application/json';
    }

    const body = hasBody ? JSON.stringify(opt.body) : undefined;

    const res = await fetch(url, { method, headers, body });
    // Fast-path: 204 No Content
    if (res.status === 204) return undefined as unknown as T;

    // Try to parse JSON first; if content-type is text or empty, return text
    const ct = res.headers.get('content-type') || '';
    const raw = await res.text();
    const payload = ct.includes('application/json') && raw ? JSON.parse(raw) : (raw as unknown);

    if (!res.ok) {
      // Throw a typed error with parsed payload for the caller to inspect
      throw new ApiError(res.status, url, payload, `${method} ${path} failed`);
    }

    return payload as T;
  }

  // Thin CRUD helpers
  const get = <T>(path: string, query?: Record<string, unknown>) =>
    request<T>('GET', path, { query });

  const post = <T>(path: string, body?: unknown) => request<T>('POST', path, { body });

  const put = <T>(path: string, body?: unknown) => request<T>('PUT', path, { body });

  const patch = <T>(path: string, body?: unknown) => request<T>('PATCH', path, { body });

  const del = <T>(path: string, query?: Record<string, unknown>) =>
    request<T>('DELETE', path, { query });

  return { baseURL, request, get, post, put, patch, del };
}

// Default singleton: reads token from localStorage (customize as needed)
const api = createClient(DEFAULT_BASE, () => localStorage.getItem('token') || undefined);

export default api;
