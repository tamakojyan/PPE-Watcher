import {
  Grid,
  Button,
  Table,
  TableBody,
  TableHead,
  TableContainer,
  TablePagination,
  TableCell,
  TableRow,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
} from '@mui/material';
import { useTheme } from '@mui/material';

import React, { useState, useEffect } from 'react';
import { getMyBookmarks } from '../../../api/bookmark';
import { useBookmarksFromOutlet } from '../../../hooks/useBookmarksFromOutlet';
import Bookmarkbutton from '../../../components/BookmarkButton';
import DateRangePicker from '../../../components/DateRangePicker';
import KeywordSearch from '../../../components/KeywordSearch';
import ViolationDetailDialog from '../../../components/ViolationDetailDialog';
import { Violation, ViolationKind, ViolationType, ViolationStatus } from '@/type';
export default function Bookmarks(): React.ReactElement {
  const { loading } = useBookmarksFromOutlet();
  const [filters, setFilters] = useState<{ from?: number; to?: number; keyword?: string }>({});

  // UI-friendly row type
  type ViolationRow = {
    id: string;
    typeText: string;
    status: string;
    timestampText: string;
    imageUrl?: string | null;
    confidence?: number;
    handler?: string;
    raw: Violation; // keep full Violation for Detail
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

  // --- Bookmark API type ---
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

  // --- Adapter ---
  function toViolationRow(item: BookmarkItem): ViolationRow {
    const v = item.violation;

    // Build full Violation for DetailDialog
    const violation: Violation = {
      id: v.id,
      status: v.status as ViolationStatus,
      ts: v.ts ?? '',
      snapshotUrl: v.snapshotUrl ?? undefined,
      confidence: v.confidence,
      handler: v.handler ?? '',
      kinds: (v.kinds ?? []).map(
        (k): ViolationKind => ({
          violationId: v.id,
          type: k.type as ViolationType,
        })
      ),
      bookmarkedBy: [], // default
    };

    return {
      id: v.id,
      typeText: (v.kinds ?? []).map((k) => k.type).join(', '),
      status: v.status,
      timestampText: formatTs(v.ts),
      imageUrl: v.snapshotUrl ?? null,
      confidence: v.confidence,
      handler: v.handler ?? undefined,
      raw: violation,
    };
  }

  // --- State ---
  const [BookmarkRows, setBookmarkRows] = useState<ViolationRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(15);
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);

  // Fetch bookmark violations
  useEffect(() => {
    (async () => {
      const params = {
        skip: page * rowsPerPage,
        take: rowsPerPage,
        sort: 'violation.ts:desc',
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
    <Grid container sx={{ flex: 1, minHeight: 0, bgcolor: 'background.paper' }} direction="column">
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
                        <Button
                          sx={{ maxWidth: 100 }}
                          variant="contained"
                          onClick={() => setSelectedViolation(row.raw)}
                        >
                          Detail
                        </Button>
                      </TableCell>
                      <TableCell>
                        {/* Only here: remove row immediately after unbookmark */}
                        <Bookmarkbutton
                          violationId={row.id}
                          onChange={() => {
                            setBookmarkRows((prev) => prev.filter((r) => r.id !== row.id));
                            setTotal((prev) => prev - 1);
                          }}
                        />
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

      {/*  Violation Detail Dialog */}
      <ViolationDetailDialog
        open={!!selectedViolation}
        violation={selectedViolation}
        onClose={() => setSelectedViolation(null)}
        onUnbookmark={(id) => {
          setBookmarkRows((prev) => prev.filter((r) => r.id !== id));
          setTotal((prev) => prev - 1);
        }}
      />
    </Grid>
  );
}
