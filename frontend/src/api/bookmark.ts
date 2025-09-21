import api from './client';

export interface BookmarkItem {
  userId: string;
  violationId: string;
  createdAt: string;
  violation: {
    id: string;
    status: 'open' | 'resolved';
    ts: string;
    handler?: string | null;
    kinds: { type: string }[];
  };
}

export interface BookmarkResponse {
  items: BookmarkItem[];
  total: number;
  skip: number;
  take: number;
}

// Keep same query shape as notifications/violations
export async function getMyBookmarks(params: {
  skip?: number;
  take?: number;
  sort?: string;
  from?: number;
  to?: number;
  keyword?: string;
}): Promise<BookmarkResponse> {
  return api.get<BookmarkResponse>('/me/bookmarks', params);
}
/** Lightweight: fetch only violation ids for fast global mark */
export async function getMyBookmarkIds(): Promise<string[]> {
  // You already have (or will add) this backend route:
  // GET /me/bookmark-ids  ->  ["VIO001", "VIO002", ...]
  return api.get('/me/bookmark-ids');
}

/** Add a bookmark (optimistic update recommended on UI) */
export async function addBookmark(violationId: string): Promise<{ ok: true }> {
  // POST /bookmarks/:violationId  ->  { ok: true }
  return api.post(`/bookmarks/${violationId}`, {});
}

/** Remove a bookmark */
export async function removeBookmark(violationId: string): Promise<void> {
  // DELETE /bookmarks/:violationId -> 204 No Content
  await api.del(`/bookmarks/${violationId}`);
}
