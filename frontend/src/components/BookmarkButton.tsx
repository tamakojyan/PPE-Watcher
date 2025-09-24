// src/components/BookmarkButton.tsx
import * as React from 'react';
import { IconButton } from '@mui/material';
import Favorite from '@mui/icons-material/Favorite';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import { pink } from '@mui/material/colors';
import { useTheme } from '@mui/material/styles';
import { useBookmarksFromOutlet } from '../hooks/useBookmarksFromOutlet';

type BookmarkButtonProps = {
  violationId: string;
  onChange?: () => void; //  optional callback (used only in Bookmarks page)
};

/**
 * Bookmark toggle button
 * - Shows filled or empty heart depending on bookmark state
 * - Colors adapt to light/dark theme
 * - Toggling updates global bookmark state (via Outlet context)
 * - Calls `onChange` ONLY when a bookmark is removed (for Bookmarks page list refresh)
 */
export default function BookmarkButton({ violationId, onChange }: BookmarkButtonProps) {
  const theme = useTheme();
  const { isBookmarked, toggleBookmark } = useBookmarksFromOutlet();

  const marked = isBookmarked(violationId);

  async function handleClick() {
    const before = marked;
    await toggleBookmark(violationId);

    // ✅ if it was bookmarked and now removed → trigger onChange
    if (before && onChange) {
      onChange();
    }
  }

  return (
    <IconButton onClick={handleClick}>
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
