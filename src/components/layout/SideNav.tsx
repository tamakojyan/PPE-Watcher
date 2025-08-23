import * as react from 'react';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';

type props = {
  mobileOpen: boolean;
  onClose: () => void;
};

const drawerWidth = 240;
export default function SideNav({ mobileOpen, onClose }: props): React.ReactElement {
  return <Box></Box>;
}

export { drawerWidth };
