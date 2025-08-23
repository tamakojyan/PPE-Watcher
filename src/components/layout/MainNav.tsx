import * as React from 'react';
import { AppBar, Toolbar, Tabs, Tab } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { drawerWidth } from './SideNav';

const Main = [
  { key: 'dashboard', label: 'Dashboard', defaultPath: '/overview' },
  { key: 'history', label: 'History', defaultPath: '/violations' },
  { key: 'settings', label: 'Settings', defaultPath: '/alerts-settings' },
] as const;
type MainKey = (typeof Main)[number]['key'];

const GROUPS: Record<MainKey, Set<string>> = {
  dashboard: new Set(['overview', 'live', 'alerts']),
  history: new Set(['violations', 'archive', 'snapshots', 'reports']),
  settings: new Set(['alerts-settings', 'contacts', 'sender', 'security']),
};

function deriveMainKey(pathname: string): MainKey {
  const first = pathname.split('/')[1] ?? '';
  if (GROUPS.history.has(first)) return 'history';
  if (GROUPS.settings.has(first)) return 'settings';
  return 'dashboard';
}

type Props = { isMobile: boolean };

export default function MainNav({ isMobile }: Props): React.ReactElement | null {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const activeKey = React.useMemo<MainKey>(() => deriveMainKey(pathname), [pathname]);

  const handleChange = (_: React.SyntheticEvent, nextKey: MainKey) => {
    const target = Main.find((m) => m.key === nextKey)!;
    navigate(target.defaultPath); // 切到该组的默认子页
  };

  return (
    <AppBar
      position="fixed"
      color="default"
      elevation={0}
      sx={{
        top: { xs: 56, sm: 64 },
        zIndex: (t) => t.zIndex.appBar - 1,
      }}
    >
      <Toolbar sx={{ p: 0 }}>
        <Tabs
          value={activeKey}
          onChange={handleChange}
          aria-label="Main navigation"
          variant={isMobile ? 'scrollable' : 'standard'}
          sx={{ ml: 1, pl: { md: `${drawerWidth - 40}px` } }}
        >
          {Main.map((m) => (
            <Tab key={m.key} value={m.key} label={m.label} sx={{ mx: 5 }} />
          ))}
        </Tabs>
      </Toolbar>
    </AppBar>
  );
}
