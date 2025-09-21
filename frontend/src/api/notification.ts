// src/api/notification.ts
import api from './client';

export type NotificationStatus = 'unhandled' | 'handled';

/** Update status and optional note for a notification */
export async function updateNotificationStatus(
  id: string,
  status: NotificationStatus,
  note?: string
): Promise<{ id: string; status: NotificationStatus; note?: string }> {
  // Backend: PATCH /notifications/:id  { status, note }
  const res = await api.patch(`/notifications/${id}`, { status, note });
  return res as any; // adapt to your api.client return shape if needed
}
