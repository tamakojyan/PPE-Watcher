import * as react from 'react';
import {
  Grid,
  Stack,
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
import TestViolationButton from '../../../components/TestViolationButton';
import DateRangePicker from '../../../components/DateRangePicker';
import KeywordSearch from '../../../components/KeywordSearch';

import React, { useEffect, useState, useContext } from 'react';
import { useTheme } from '@mui/material';
import { Violation } from '@/type';
import api from '../../../api/client';
import { useBookmarksFromOutlet } from '../../../hooks/useBookmarksFromOutlet';
import Bookmarkbutton from '../../../components/BookmarkButton';
import ResolveButton from '../../../components/ResolveButton';
import { RefreshContext } from '../../../components/layout/AppShell';
import ViolationDetailDialog from '../../../components/ViolationDetailDialog';
export default function SearchViolations(): React.ReactElement {
  const { loading } = useBookmarksFromOutlet();
  const { tick } = useContext(RefreshContext);
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(15);
  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    setRowsPerPage(value);
    setPage(0);
  };
  const [total, setTotal] = useState<number>(0);
  // UI-friendly row type for the table and detail panel
  type ViolationRow = {
    id: string;
    typeText: string; // Flattened kinds into a string (e.g. "Helmet, Vest")
    status: string;
    timestampText: string; // Human-readable timestamp
    imageUrl?: string | null;
    confidence?: number;
    handler?: string; // New: handler name or ID
  };

  // Time formatter (local timezone, readable style)
  const dtf = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  // Convert raw ISO timestamp string into human-readable text
  function formatTs(ts?: string): string {
    if (!ts) return '';
    const d = new Date(ts);
    return Number.isNaN(+d) ? ts : dtf.format(d);
  }
  // Adapter: transform backend Violation object into UI-friendly ViolationRow
  function toRow(v: Violation): ViolationRow {
    return {
      id: v.id,
      // Convert kinds[] into a comma-separated string
      typeText: (v.kinds ?? []).map((k) => k.type).join(', '),
      status: v.status,
      // Format timestamp into human-readable form
      timestampText: formatTs(v.ts),
      imageUrl: v.snapshotUrl
        ? v.snapshotUrl.startsWith('http')
          ? v.snapshotUrl
          : `${api.baseURL}/uploads/${v.snapshotUrl.split('/').pop()}`
        : null,
      confidence: v.confidence,
      handler: v.handler, // Pass through handler for UI usage
    };
  }
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Violation | null>(null);

  function handleDetail(v: ViolationRow) {
    // Re-fetch this violation to ensure the latest information
    api.get<Violation>(`/violations/${v.id}`).then((res) => {
      setSelected(res);
      setDetailOpen(true);
    });
  }

  const [visibleRows, setVisibleRows] = useState<ViolationRow[]>([]);

  const [filters, setFilters] = useState<{ from?: number; to?: number; keyword?: string }>({});
  // ------------------
  // Filter UI
  // ------------------

  useEffect(() => {
    // Build query params
    const params: any = {
      page,
      pageSize: rowsPerPage,
      sort: 'ts:desc',
    };

    // Add optional filters if present
    if (filters.from) params.from = filters.from;
    if (filters.to) params.to = filters.to;
    if (filters.keyword) params.keyword = filters.keyword;

    api
      .get<{
        items: Violation[];
        total: number;
        skip: number;
        take: number;
      }>('/violations', params)
      .then((res) => {
        // Convert API data into UI-friendly rows
        console.log('API response', res);
        setVisibleRows(res.items.map(toRow));
        setTotal(res.total);
      });
  }, [page, rowsPerPage, filters, tick]);
  async function handleResolve(id: string) {
    setDetailOpen(false);

    // Refresh the list after resolving
    api
      .get<{ items: Violation[] }>('/violations', { sort: 'ts:desc' })
      .then((res) => setVisibleRows(res.items.map(toRow)));
  }
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
            <Typography variant={'h6'}>Search Violations</Typography>
          </Grid>
          <Grid size={{ xs: 3, md: 1 }}>
            <TestViolationButton />
          </Grid>
          <Grid size={{ xs: 3, md: 1 }}>
            <Button>Help</Button>
          </Grid>
        </Grid>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Card sx={{ my: 3 }}>
          <CardHeader title="Search Criteria" />
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
        <Grid container sx={{ height: '100%', minHeight: 0 }} spacing={1}>
          <Grid size={{ xs: 12, lg: 12 }}>
            <Card sx={{ height: { xs: 'auto', md: '100%' }, border: '1px solid' }}>
              <CardHeader
                title={'List'}
                slotProps={{
                  title: {
                    variant: 'body1',
                  },
                }}
              />
              <Divider />
              <CardContent sx={{ height: { xs: 'auto', md: '100%' }, border: '1px solid' }}>
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
                      {visibleRows.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.id}</TableCell>
                          <TableCell>{item.typeText}</TableCell>
                          <TableCell>{item.timestampText}</TableCell>
                          <TableCell>{item.handler}</TableCell>
                          <TableCell>
                            {/* Use the reusable ResolveButton component */}
                            <ResolveButton
                              violationId={item.id}
                              status={item.status}
                              onResolved={() => {
                                // Refresh table after resolving
                                api
                                  .get<{ items: Violation[] }>('/violations', { sort: 'ts:desc' })
                                  .then((res) => setVisibleRows(res.items.map(toRow)));
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              sx={{ maxWidth: 100 }}
                              variant={'contained'}
                              onClick={() => handleDetail(item)}
                            >
                              Detail
                            </Button>
                          </TableCell>
                          <TableCell>
                            <Bookmarkbutton violationId={item.id} />
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
      </Grid>
      <ViolationDetailDialog
        open={detailOpen}
        violation={selected}
        onClose={() => setDetailOpen(false)}
        onResolve={handleResolve}
      />
    </Grid>
  );
}
