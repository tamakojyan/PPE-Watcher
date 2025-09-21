import * as react from 'react';
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
  TableFooter,
  Button,
  Paper,
  Box,
  Divider,
  Card,
  CardContent,
  TablePagination,
  IconButton,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { useEffect, useState } from 'react';
import { useTheme } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { pink } from '@mui/material/colors';
import { Violation } from '@/type';
import api from '../../../api/client';
import { useBookmarksFromOutlet } from '../../../hooks/useBookmarksFromOutlet';
import Bookmarkbutton from '../../../components/BookmarkButton';

export default function Alerts(): React.ReactElement {
  const { loading } = useBookmarksFromOutlet();
  type Stats = { open: number; resolved: number; all: number };
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api
      .get<{ open: number; resolved: number; all: number }>('/violations/stats/status')
      .then((res) => {
        setStats(res);
      });
  }, []);
  console.log(stats);

  const theme = useTheme();
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
      imageUrl: v.snapshotUrl ?? null,
      confidence: v.confidence,
      handler: v.handler, // Pass through handler for UI usage
    };
  }
  const [visibleRows, setVisibleRows] = useState<ViolationRow[]>([]);

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
      });
  }, [page, rowsPerPage]);

  const [selected, setSelected] = useState<ViolationRow | null>(null);
  const handleRowClick = (row: ViolationRow) => {
    setSelected(row);
  };
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
          <Grid size={{ xs: 12, lg: 5 }} sx={{ minHeight: 0 }}>
            <Paper>
              <TableContainer>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Id</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {visibleRows.map((row) => (
                      <TableRow key={row.id} hover onClick={() => handleRowClick(row)}>
                        <TableCell>{row.id}</TableCell>
                        <TableCell>{row.typeText}</TableCell>
                        <TableCell>{row.timestampText}</TableCell>
                        <TableCell>{row.status}</TableCell>
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
          <Grid size={{ xs: 12, lg: 7 }} sx={{ minHeight: 0 }}>
            <Stack sx={{ height: '100%', minHeight: 0, display: 'flex' }}>
              <Stack
                sx={{
                  flex: 10,
                  borderBottom: '1px solid',
                  borderColor: 'grey',
                  overflow: 'hidden',
                  minHeight: 0,
                }}
              >
                {selected ? (
                  <img
                    src={selected?.imageUrl ?? ''} // ← use imageUrl, not snapshotUrl
                    alt=""
                    style={{
                      minHeight: 0,
                      maxWidth: '100%',
                      maxHeight: '750px',
                      objectFit: 'contain',
                    }}
                  />
                ) : (
                  <Typography> Click A row to preview</Typography>
                )}
              </Stack>
              <Stack sx={{ flex: 2 }}>
                {selected ? (
                  <TableContainer>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>Id</TableCell>
                          <TableCell width={'500px'}>Type</TableCell>
                          <TableCell>Time</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Handler</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>{selected?.id}</TableCell>
                          <TableCell>{selected?.typeText}</TableCell>
                          <TableCell>{selected?.timestampText}</TableCell>
                          <TableCell>{selected?.status}</TableCell>
                          <TableCell>{selected?.handler ?? '-'}</TableCell>
                          <TableCell>
                            {selected?.status === 'open' ? (
                              <Button
                                variant="contained"
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
                                variant="contained"
                                disabled
                                sx={{ maxWidth: 100 }}
                                color="success"
                              >
                                Resolved
                              </Button>
                            )}
                          </TableCell>
                          <TableCell>
                            <Bookmarkbutton violationId={selected?.id} />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography> Click A row to preview</Typography>
                )}
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
