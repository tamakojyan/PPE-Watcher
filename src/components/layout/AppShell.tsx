import * as react from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Box, CssBaseline, Toolbar, useMediaQuery, useTheme, createTheme } from '@mui/material';
import { useState } from 'react';
import TopBar from './TopBar';
import SideNav, { drawerWidth } from './SideNav';
import Footer from './Footer';

export default function AppShell(): React.ReactElement {
  const useMQ = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleDrawer = () => setMobileOpen((p) => !p);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      <TopBar onMenuClick={toggleDrawer} onToggleTheme={toggleTheme} title={'PPE Watcher'} />
      <SideNav mobileOpen={mobileOpen} onClose={toggleDrawer} />
      {/*MainContent*/}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
          width: { md: `calc(100%-${drawerWidth})` },
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/*PlaceHolder*/}
        <Toolbar />
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Outlet />
        </Box>
        <Footer />
      </Box>
    </Box>
  );
}
