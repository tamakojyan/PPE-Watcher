import * as react from 'react';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Box,
} from '@mui/material';
type props = {
  mobileOpen: boolean;
  onClose: () => void;
};

const drawerWidth = 240;
export default function SideNav({ mobileOpen, onClose }: props): React.ReactElement {
  return <Box></Box>;
}

export { drawerWidth };
