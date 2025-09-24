// src/api/violations.ts
import api from './client';

// Call backend to resolve violation
export async function resolveViolation(id: string) {
  // PATCH /api/violations/:id/resolve
  return api.patch(`/violations/${id}/resolve`);
}
