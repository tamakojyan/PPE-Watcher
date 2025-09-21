import { useOutletContext } from 'react-router-dom';
import type { BookmarkOutletContext } from '@/components/layout/AppShell';

// Tiny hook to read outlet context with proper types
export function useBookmarksFromOutlet() {
  return useOutletContext<BookmarkOutletContext>();
}
