import * as React from 'react';
import {
  AppBar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Tab,
  Tabs,
  Toolbar,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';
import { useLocation, useNavigate } from 'react-router-dom';

/** ---- Main tabs (groups) & typing ---- */
const Main = [
  { key: 'dashboard', label: 'Dashboard', defaultPath: '/overview', icon: <DashboardIcon /> },
  { key: 'history', label: 'History', defaultPath: '/violations', icon: <HistoryIcon /> },
  { key: 'settings', label: 'Settings', defaultPath: '/alerts-settings', icon: <SettingsIcon /> },
] as const;
type MainKey = (typeof Main)[number]['key'];

/** Each group owns these first-level path segments (useful for highlighting) */
const GROUPS: Record<MainKey, Set<string>> = {
  dashboard: new Set(['overview', 'live', 'alerts']),
  history: new Set(['violations', 'trends', 'notifications', 'bookmarks']),
  settings: new Set(['alerts-settings', 'contacts', 'sender', 'security']),
};

/** Derive current main group from pathname */
function deriveMainKey(pathname: string): MainKey {
  const first = pathname.split('/')[1] ?? '';
  if (GROUPS.history.has(first)) return 'history';
  if (GROUPS.settings.has(first)) return 'settings';
  return 'dashboard';
}

/** Sub-menu for each group (flat absolute paths) */
const SUB_ITEMS: Record<MainKey, Array<{ to: string; label: string }>> = {
  dashboard: [
    { to: '/overview', label: 'Overview' },
    { to: '/live', label: 'Live Feed' },
    { to: '/alerts', label: 'Alerts' },
  ],
  history: [
    { to: '/violations', label: 'Search Violations' },
    { to: '/trends', label: 'Trends' },
    { to: '/notifications', label: 'Notifications' },
    { to: '/bookmarks', label: 'Bookmarks' },
  ],
  settings: [
    { to: '/alerts-settings', label: 'Alerts & Notifications' },
    { to: '/contacts', label: 'Contacts' },
    { to: '/sender', label: 'Sender Config' },
    { to: '/security', label: 'Security' },
  ],
};

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
};

/** Full-screen mobile menu overlay */
export default function MobileMenu({ open, onClose, title = 'PPE Watcher' }: Props) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const activeKey = React.useMemo<MainKey>(() => deriveMainKey(pathname), [pathname]);
  const subItems = SUB_ITEMS[activeKey];

  const handleMainChange = (_: React.SyntheticEvent, nextKey: MainKey) => {
    const target = Main.find((m) => m.key === nextKey)!;
    navigate(target.defaultPath);
  };

  const go = (to: string) => {
    navigate(to);
    onClose();
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        display: { xs: 'block', md: 'none' },
        '& .MuiDrawer-paper': { width: '100%', height: '100%' },
      }}
    >
      {/* Top*/}
      <AppBar position="static" color="default" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flex: 1 }}>
            {title}
          </Typography>
          <IconButton onClick={onClose} aria-label="Close menu">
            <CloseIcon />
          </IconButton>
        </Toolbar>

        {/* MainNav Tabs（Dashboard / History / Settings） */}
        <Tabs
          value={activeKey}
          onChange={handleMainChange}
          variant="fullWidth"
          textColor="primary"
          indicatorColor="primary"
        >
          {Main.map((m) => (
            <Tab key={m.key} value={m.key} icon={m.icon} label={m.label} iconPosition="start" />
          ))}
        </Tabs>
      </AppBar>

      {/* SideNav */}
      <Box sx={{ overflowY: 'auto', py: 1 }}>
        <List>
          {subItems.map((it) => {
            const selected = pathname === it.to || pathname.startsWith(it.to + '/');
            return (
              <ListItemButton key={it.to} onClick={() => go(it.to)} selected={selected}>
                <ListItemText primary={it.label} />
              </ListItemButton>
            );
          })}
        </List>
        <Divider />
      </Box>
    </Drawer>
  );
}
