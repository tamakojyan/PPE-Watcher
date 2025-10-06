import * as React from 'react';
import { Drawer, List, ListItemButton, ListItemText, Toolbar, Box } from '@mui/material';
import { NavLink, useLocation } from 'react-router-dom';

const drawerWidth = 240;

type Props = {
  isMobile: boolean;
};

type MainKey = 'dashboard' | 'history' | 'settings';

const GROUPS: Record<MainKey, Set<string>> = {
  dashboard: new Set(['overview', 'alerts']),
  history: new Set(['violations', 'trends', 'notifications', 'bookmarks']),
  settings: new Set(['alerts-settings', 'contacts', 'sender', 'security']),
};

function deriveMainKey(pathname: string): MainKey {
  const first = pathname.split('/')[1] ?? '';
  if (GROUPS.history.has(first)) return 'history';
  if (GROUPS.settings.has(first)) return 'settings';
  return 'dashboard';
}

const SUB_ITEMS: Record<MainKey, { to: string; label: string }[]> = {
  dashboard: [
    { to: '/overview', label: 'Overview' },
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

export default function SideNav({ isMobile }: Props): React.ReactElement {
  const { pathname } = useLocation();
  const mainKey = deriveMainKey(pathname);
  const items = SUB_ITEMS[mainKey];

  return (
    <Drawer
      variant="permanent"
      open
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar />
      <Toolbar />
      <Box role="navigation">
        <List>
          {items.map((i) => (
            <ListItemButton
              key={i.to}
              component={NavLink}
              to={i.to}
              sx={{
                '&[aria-current="page"]': {
                  bgcolor: 'action.selected',
                  '& .MuiListItemText-primary': { fontWeight: 600 },
                },
              }}
            >
              <ListItemText primary={i.label} />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}

export { drawerWidth };
