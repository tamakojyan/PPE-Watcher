// src/components/BookmarkButton.tsx
import * as React from 'react';
import { IconButton } from '@mui/material';
import Favorite from '@mui/icons-material/Favorite';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import { pink } from '@mui/material/colors';
import { useTheme } from '@mui/material/styles';
import { useBookmarksFromOutlet } from '../hooks/useBookmarksFromOutlet';

/**
 * Bookmark toggle button
 * - Shows filled or empty heart depending on bookmark state
 * - Colors adapt to light/dark theme
 * - Toggling updates global bookmark state (via Outlet context)
 */
export default function BookmarkButton({ violationId }: { violationId: string }) {
  const theme = useTheme();
  const { isBookmarked, toggleBookmark } = useBookmarksFromOutlet();

  const marked = isBookmarked(violationId);

  return (
    <IconButton onClick={() => toggleBookmark(violationId)}>
      {marked ? (
        <Favorite
          sx={{
            color: theme.palette.mode === 'light' ? pink[500] : pink[200],
          }}
        />
      ) : (
        <FavoriteBorder
          sx={{
            color: theme.palette.mode === 'light' ? 'grey.500' : 'grey.300',
          }}
        />
      )}
    </IconButton>
  );
}
