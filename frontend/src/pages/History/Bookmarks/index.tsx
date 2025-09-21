import * as react from 'react';
import {
  Grid,
  Stack,
  Button,
  TextField,
  Table,
  TableBody,
  TableHead,
  TableContainer,
  TablePagination,
  TableCell,
  TableRow,
  TableFooter,
  TableSortLabel,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
  inputAdornmentClasses,
} from '@mui/material';
import { useTheme } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';
import React, { useState, useEffect } from 'react';
import { getMyBookmarks } from '../../../api/bookmark';
import { useBookmarksFromOutlet } from '../../../hooks/useBookmarksFromOutlet';
import Bookmarkbutton from '../../../components/BookmarkButton';
import DateRangePicker from '../../../components/DateRangePicker';
import KeywordSearch from '../../../components/KeywordSearch';
import api from '../../../api/client';
export default function Bookmarks(): React.ReactElement {
  const { loading, bookmarkIds } = useBookmarksFromOutlet();
  const [filters, setFilters] = useState<{ from?: number; to?: number; keyword?: string }>({});

  // UI-friendly row type (based on violation, not raw bookmark)
  type ViolationRow = {
    id: string;
    typeText: string; // Flattened kinds into a string (e.g. "Helmet, Vest")
    status: string;
    timestampText: string; // Human-readable timestamp
    imageUrl?: string | null;
    confidence?: number;
    handler?: string;
  };

  // --- Utilities for formatting ---
  const dtf = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  function formatTs(ts?: string): string {
    if (!ts) return '';
    const d = new Date(ts);
    return Number.isNaN(+d) ? ts : dtf.format(d);
  }

  // --- Adapter: map bookmark item -> ViolationRow ---
  type BookmarkItem = {
    violationId: string;
    createdAt: string;
    violation: {
      id: string;
      status: string;
      ts?: string;
      snapshotUrl?: string | null;
      confidence?: number;
      handler?: string | null;
      kinds?: { type: string }[];
    };
  };

  function toViolationRow(item: BookmarkItem): ViolationRow {
    const v = item.violation;
    return {
      id: v.id,
      typeText: (v.kinds ?? []).map((k) => k.type).join(', '),
      status: v.status,
      timestampText: formatTs(v.ts), // show violation timestamp
      imageUrl: v.snapshotUrl ?? null,
      confidence: v.confidence,
      handler: v.handler ?? undefined,
    };
  }

  // --- Page component ---
  const [BookmarkRows, setBookmarkRows] = useState<ViolationRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(15);

  // Fetch bookmark violations whenever page or rowsPerPage changes
  useEffect(() => {
    (async () => {
      const params = {
        skip: page * rowsPerPage,
        take: rowsPerPage,
        sort: 'violation.ts:desc', // ✅ same format as backend expects
        ...(filters.from ? { from: filters.from } : {}),
        ...(filters.to ? { to: filters.to } : {}),
        ...(filters.keyword ? { keyword: filters.keyword } : {}),
      };

      const res = await getMyBookmarks(params);
      setBookmarkRows(res.items.map(toViolationRow));
      setTotal(res.total);
    })();
  }, [page, rowsPerPage, filters]);

  // Handlers for pagination
  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    setRowsPerPage(value);
    setPage(0);
  };

  const theme = useTheme();
  if (loading) return <div>Loading…</div>;

  return (
    <Grid
      container
      sx={{ flex: 1, minHeight: 0, bgcolor: 'background.paper' }}
      direction={'column'}
    >
      <Grid size={{ xs: 12 }}>
        <Grid container>
          <Grid size={{ xs: 6, md: 10 }}>
            <Typography variant={'h6'}>Bookmarks</Typography>
          </Grid>
          <Grid size={{ xs: 3, md: 1 }}>
            <Button> Export</Button>
          </Grid>
          <Grid size={{ xs: 3, md: 1 }}>
            <Button>Help</Button>
          </Grid>
        </Grid>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Card sx={{ my: 3 }}>
          <CardHeader title="ToolBar" />
          <Divider />
          <CardContent>
            <Grid container spacing={2}>
              <DateRangePicker
                onChange={({ from, to }) => setFilters((prev) => ({ ...prev, from, to }))}
              />
              <KeywordSearch onSearch={(keyword) => setFilters((prev) => ({ ...prev, keyword }))} />
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12 }} sx={{ flex: 1, minHeight: 0 }}>
        <Card>
          <CardHeader title={'Bookmarks List'} />
          <Divider />
          <CardContent>
            <TableContainer>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Id</TableCell>
                    <TableCell width={'500px'}>Type</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Handler</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Detail</TableCell>
                    <TableCell>Bookmarks</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {BookmarkRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.id}</TableCell>
                      <TableCell>{row.typeText}</TableCell>
                      <TableCell>{row.timestampText}</TableCell>
                      <TableCell>{row.handler}</TableCell>
                      <TableCell>{row.status}</TableCell>
                      <TableCell>
                        {row.status === 'open' ? (
                          <Button
                            variant={'contained'}
                            sx={{
                              maxWidth: 100,
                              bgcolor:
                                theme.palette.mode === 'light'
                                  ? theme.palette.error.main
                                  : '#5f0e06',
                            }}
                          >
                            Resolve
                          </Button>
                        ) : (
                          <Button
                            variant={'contained'}
                            disabled
                            sx={{ maxWidth: 100 }}
                            color={'success'}
                          >
                            Resolved
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button sx={{ maxWidth: 100 }} variant={'contained'}>
                          Detail
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Bookmarkbutton violationId={row.id} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[15, 30]}
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
