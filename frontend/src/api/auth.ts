// src/api/auth.ts
import api from './client';

/**
 * Login user and get JWT token
 * @param id user ID
 * @param password user password
 */
export async function login(id: string, password: string): Promise<{ token: string }> {
  // api.post 已经返回 JSON 数据，不需要再取 .data
  const res = await api.post<{ token: string }>('/login', { id, password });
  return res;
}

/**
 * Optional: logout just clears token locally
 */
export function logout() {
  localStorage.removeItem('token');
}

/**
 * Optional: check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!localStorage.getItem('token');
}
