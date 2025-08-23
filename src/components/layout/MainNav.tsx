import * as react from 'react';
import { AppBar, Toolbar, Tabs, Tab, useTheme, useMediaQuery } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { drawerWidth } from './SideNav';

const Main = [
  { key: 'dashboard', label: 'Dashboard', defaultPath: '/' },
  { key: 'history', label: 'History', defaultPath: '/history' },
  { key: 'settings', label: 'Settings', defaultPath: '/settings' },
] as const;

type MainKey = (typeof Main)[number]['key'];

function deriveMainKey(pathname: string): MainKey {
  if (pathname.startsWith('/settings')) return 'settings';
  if (pathname.startsWith('/history')) return 'history';
  return 'dashboard';
}
type Props = { isMobile: boolean };

export default function MainNav({ isMobile }: Props): React.ReactElement | null {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  if (isMobile) return null;
  const mainKey = deriveMainKey(pathname);
  const idx = Math.max(
    0,
    Main.findIndex((m) => m.key === mainKey)
  );
  const handleChange = (_event: React.SyntheticEvent, i: number) => {
    navigate(Main[i].defaultPath);
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
      {' '}
      <Toolbar sx={{ p: 0 }}>
        <Tabs
          value={idx}
          onChange={handleChange}
          sx={{ ml: 1, pl: { md: `${drawerWidth - 40}px` } }}
        >
          {Main.map((m) => (
            <Tab key={m.key} label={m.label} sx={{ mx: 5 }} />
          ))}
        </Tabs>
      </Toolbar>
    </AppBar>
  );
}
