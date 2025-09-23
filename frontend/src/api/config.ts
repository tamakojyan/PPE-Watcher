// src/api/config.ts
import api from './client';

// Response type for full config
export type ConfigData = Record<string, any>;

// Get all system configurations
export async function getConfig(): Promise<ConfigData> {
  return api.get<ConfigData>('/config');
}

// Update one or multiple configurations
export async function updateConfig(data: Record<string, any>): Promise<{ success: boolean }> {
  return api.post<{ success: boolean }>('/config', data);
}
