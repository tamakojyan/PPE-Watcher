// src/layout/menuConfig.ts
export type MainKey = 'dashboard' | 'events' | 'settings';

export type SubItem = {
  key: string;
  label: string;
  path: string;
  order?: number;
  hidden?: boolean;
};

export type MainItem = {
  key: MainKey;
  label: string;
  order?: number;
  defaultSubKey: string;
  children: SubItem[];
};

export const MENU_CONFIG: MainItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    order: 1,
    defaultSubKey: 'overview',
    children: [{ key: 'overview', label: 'Overview', path: '/' }],
  },
  {
    key: 'events',
    label: 'Events',
    order: 2,
    defaultSubKey: 'all',
    children: [
      { key: 'all', label: 'All Events', path: '/history' },
      // 可选：{ key: "review", label: "Reviews", path: "/history/review" },
    ],
  },
  {
    key: 'settings',
    label: 'Settings',
    order: 3,
    defaultSubKey: 'general',
    children: [
      { key: 'general', label: 'General', path: '/settings/general' },
      // 再加：cameras/ppe-rules/alerts/users ...
    ],
  },
];

export function deriveMainKey(pathname: string): MainKey {
  if (pathname.startsWith('/settings')) return 'settings';
  if (pathname.startsWith('/history')) return 'events';
  return 'dashboard';
}
