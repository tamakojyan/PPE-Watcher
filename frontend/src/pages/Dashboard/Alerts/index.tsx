import {
  Stack,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Paper,
  Card,
  CardContent,
  TablePagination,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { useEffect, useState, useContext } from 'react';
import { RefreshContext } from '../../../components/layout/AppShell';

import { Violation } from '@/type';
import api from '../../../api/client';
import { useBookmarksFromOutlet } from '../../../hooks/useBookmarksFromOutlet';
import Bookmarkbutton from '../../../components/BookmarkButton';
import ResolveButton from '../../../components/ResolveButton';
import ViolationDetailDialog from '../../../components/ViolationDetailDialog';

export default function Alerts(): React.ReactElement {
  const { tick } = useContext(RefreshContext);
  const { loading } = useBookmarksFromOutlet();
  type Stats = { open: number; resolved: number; all: number };
  const [stats, setStats] = useState<Stats | null>(null);

  const openCount = stats?.open ?? 0;
  const resolvedCount = stats?.resolved;
  const totalCount = stats?.all;
  const status = [
    { label: 'Open', value: openCount, icon: <ErrorIcon color="error" /> },
    { label: 'Resolved', value: resolvedCount, icon: <CheckCircleIcon color="success" /> },
    { label: 'Total', value: totalCount, icon: <ListAltIcon color="primary" /> },
  ];

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
  const [visibleRows, setVisibleRows] = useState<ViolationRow[]>([]);
  useEffect(() => {
    api
      .get<{ open: number; resolved: number; all: number }>('/violations/stats/status')
      .then((res) => {
        setStats(res);
      });
  }, [visibleRows]);
  console.log(stats);

  useEffect(() => {
    api
      .get<{
        items: Violation[];
        total: number;
        skip: number;
        take: number;
      }>('/violations', { status: 'open', page, pageSize: rowsPerPage, sort: 'ts:desc' })
      .then((res) => {
        // Convert API data into UI-friendly rows
        setVisibleRows(res.items.map(toRow));
        setTotal(res.total);
        console.log(res.items);
      });
  }, [page, rowsPerPage, tick]);

  const [selected, setSelected] = useState<Violation | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  async function handleResolve(id: string) {
    setDetailOpen(false);

    // Refresh the list after resolving
    api
      .get<{ items: Violation[] }>('/violations', { sort: 'ts:desc' })
      .then((res) => setVisibleRows(res.items.map(toRow)));
  }
  function handleDetail(v: ViolationRow) {
    // Re-fetch this violation to ensure the latest information
    api.get<Violation>(`/violations/${v.id}`).then((res) => {
      setSelected(res);
      setDetailOpen(true);
    });
  }

  if (loading) return <div>Loading…</div>;

  return (
    <Grid
      container
      direction="column"
      spacing={2}
      sx={{ bgcolor: 'background.paper', minHeight: 0, flex: 1 }}
    >
      <Grid size={{ xs: 12 }}>
        <Typography variant="h6">Alerts</Typography>
      </Grid>

      <Grid size={{ xs: 12 }} sx={{ color: 'primary.main' }}>
        <Grid container spacing={2}>
          {status.map((s) => (
            <Grid size={{ xs: 12, sm: 4 }} key={s.label}>
              <Card sx={{ p: 1 }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Typography variant="subtitle1">{s.label}</Typography>
                    <Typography variant="h5" color="primary" fontWeight="bold">
                      {s.value}
                    </Typography>
                    {s.icon}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Grid>

      <Grid size={{ xs: 12 }} sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <Grid container sx={{ flex: 1, minHeight: 0 }}>
          <Grid size={{ xs: 12, lg: 12 }} sx={{ minHeight: 0 }}>
            <Paper>
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
            </Paper>
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
