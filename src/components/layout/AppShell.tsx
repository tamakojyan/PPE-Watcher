import * as react from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Box, CssBaseline, Toolbar, useMediaQuery, useTheme, createTheme } from '@mui/material';
import { useState } from 'react';
import TopBar from './TopBar';
import SideNav, { drawerWidth } from './SideNav';
import Footer from './Footer';
import MainNav from './MainNav';

export default function AppShell(): React.ReactElement {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const toggleDrawer = () => setMobileOpen((p) => !p);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      <TopBar onMenuClick={toggleDrawer} title={'PPE Watcher'} isMobile={isMobile} />
      {isMobile || <MainNav isMobile={isMobile} />}

      {/*MainContent*/}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
          ml: { md: `${drawerWidth}px` },
          display: 'flex',
          flexDirection: 'column',
          zIndex: (t) => t.zIndex.appBar - 2,
        }}
      >
        {/*PlaceHolder*/}
        {isMobile || <Toolbar />}
        <Toolbar />
        {isMobile || <SideNav isMobile={isMobile} />}

        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'pink',
          }}
        >
          <Outlet />
        </Box>
        <Footer Company="SafeVision Inc." Version="1.0" />
      </Box>
    </Box>
  );
}
