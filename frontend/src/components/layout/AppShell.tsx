// src/components/layout/AppShell.tsx
import * as React from 'react';
import { Box, CssBaseline, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import TopBar from './TopBar';
import SideNav from './SideNav';
import Footer from './Footer';
import MobileMenu from './MobileMenu';
import MainNav from './MainNav';
import { isAuthenticated } from '../../api/auth'; // your auth util
import { useState } from 'react';
import { getMyBookmarkIds, addBookmark, removeBookmark } from '../../api/bookmark';

export type BookmarkOutletContext = {
  bookmarkIds: Set<string>;
  loading: boolean;
  isBookmarked: (id: string) => boolean;
  toggleBookmark: (id: string) => Promise<void>;
  refreshBookmarks: () => Promise<void>;
};

export default function AppShell(): React.ReactElement {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();

  const toggleDrawer = () => setMobileOpen((p) => !p);
  const closeDrawer = () => setMobileOpen(false);

  const [bookmarkIds, setBookmarkIds] = React.useState<Set<string>>(new Set());
  const [loading, setLoading] = React.useState(true);

  // Pull once on mount (and when user logs in)
  const refreshBookmarks = React.useCallback(async () => {
    setLoading(true);
    try {
      const ids = await getMyBookmarkIds(); // ["VIO001", "VIO002", ...]
      setBookmarkIds(new Set(ids));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refreshBookmarks();
  }, [refreshBookmarks]);

  // Check helper
  const isBookmarked = React.useCallback((id: string) => bookmarkIds.has(id), [bookmarkIds]);

  // Optimistic toggle (add/remove)
  const toggleBookmark = React.useCallback(
    async (violationId: string) => {
      const existed = bookmarkIds.has(violationId);
      const prev = bookmarkIds;
      const next = new Set(prev);
      if (existed) next.delete(violationId);
      else next.add(violationId);
      setBookmarkIds(next); // optimistic UI

      try {
        if (existed) {
          await removeBookmark(violationId);
        } else {
          await addBookmark(violationId);
        }
      } catch {
        // rollback on failure
        setBookmarkIds(prev);
      }
    },
    [bookmarkIds]
  );

  const outletCtx = React.useMemo<BookmarkOutletContext>(
    () => ({
      bookmarkIds,
      loading,
      isBookmarked,
      toggleBookmark,
      refreshBookmarks,
    }),
    [bookmarkIds, loading, isBookmarked, toggleBookmark, refreshBookmarks]
  );
  //  Guard: redirect unauthenticated users to login
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      <TopBar onMenuClick={toggleDrawer} title="PPE Watcher" isMobile={isMobile} />
      {isMobile || <MainNav isMobile={isMobile} />}

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flex: 1,
          p: 2,
          ml: { md: `${240}px` }, // adjust drawer width if needed
          display: 'flex',
          flexDirection: 'column',
          zIndex: (t: any) => t.zIndex.appBar - 2,
          overflow: 'hidden',
        }}
      >
        {/* Placeholder for toolbar */}
        {isMobile || <Toolbar />}
        <Toolbar />
        {isMobile || <SideNav isMobile={isMobile} />}

        {/* Page content */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            bgcolor:
              theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[100],
          }}
        >
          <Outlet context={outletCtx} />
        </Box>

        {/* Footer */}
        <Footer Company="SafeVision Inc." Version="1.0" />
      </Box>

      {/* Mobile menu */}
      <MobileMenu open={mobileOpen} onClose={closeDrawer} title="PPE Watcher" />
    </Box>
  );
}
