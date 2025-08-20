import * as react from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Box, CssBaseline, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import { useState } from 'react';
import TopBar from './TopBar';
import SideNav from './SideNav';
import Footer from './Footer';

export default function AppShell() {
  const theme = useTheme();
  const useMQ = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleDrawer = () => setMobileOpen((p) => !p);
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      <TopBar onMenuClick={toggleDrawer} />
    </Box>
  );
}
