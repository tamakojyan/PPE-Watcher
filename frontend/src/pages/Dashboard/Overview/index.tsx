import {
  Typography,
  Stack,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';
import ErrorIcon from '@mui/icons-material/Error';
import { useTheme } from '@mui/material/styles';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ViolationDetailDialog from '../../../components/ViolationDetailDialog';
import { RefreshContext } from '../../../components/layout/AppShell';

import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import RemoveIcon from '@mui/icons-material/Remove';
import VideocamIcon from '@mui/icons-material/Videocam';
import EventIcon from '@mui/icons-material/Event';
import api from '../../../api/client';
import { Violation } from '@/type';
import { useBookmarksFromOutlet } from '../../../hooks/useBookmarksFromOutlet';
import ResolveButton from '../../../components/ResolveButton';

import Bookmarkbutton from '../../../components/BookmarkButton';
export default function Dashboard(): React.ReactElement {
  const { tick } = useContext(RefreshContext);

  const { loading } = useBookmarksFromOutlet();
  type Stats = { open: number; resolved: number; all: number; today: number; trend: number };
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api
      .get<{
        open: number;
        resolved: number;
        all: number;
        today: number;
        trend: number;
      }>('/violations/stats/status')
      .then((res) => {
        setStats(res);
      });
  }, []);
  console.log(stats);
  const navigate = useNavigate();
  const openCount = stats?.open ?? 0;
  const theme = useTheme();

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
      }>('/violations', { sort: 'ts:desc' })
      .then((res) => {
        // Convert API data into UI-friendly rows
        setVisibleRows(res.items.map(toRow));
        console.log(res.items);
      });
  }, [tick]);

  // Add state inside the component
  const [selected, setSelected] = useState<Violation | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Callback when clicking the "Detail" button
  function handleDetail(v: ViolationRow) {
    // Re-fetch this violation to ensure the latest information
    api.get<Violation>(`/violations/${v.id}`).then((res) => {
      setSelected(res);
      setDetailOpen(true);
    });
  }

  // Handle "Resolve" action - only refresh UI, API call already done inside ResolveButton
  async function handleResolve(id: string) {
    setDetailOpen(false);

    // Refresh the list after resolving
    api
      .get<{ items: Violation[] }>('/violations', { sort: 'ts:desc' })
      .then((res) => setVisibleRows(res.items.map(toRow)));
  }
  if (loading) return <div>Loading…</div>;

  return (
    <Stack direction={'column'} sx={{ flex: 1, minHeight: 0 }}>
      <Grid
        container
        direction={'column'}
        spacing={2}
        sx={{ bgcolor: 'background.paper', minHeight: 0 }}
      >
        <Grid size={{ xs: 12, md: 12 }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ width: '100%', bgcolor: 'background.paper' }}
          >
            <Typography variant="h6" sx={{ flex: 1 }}>
              Overview
            </Typography>
            <Button
              variant="contained"
              sx={{ boxShadow: 'none' }}
              onClick={() => navigate('/live')}
            >
              Go live
            </Button>
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 12 }}>
          <Grid container direction="row" spacing={5} justifyContent={'space-between'}>
            <Grid size={{ xs: 12, md: 6, lg: 3 }} sx={{ px: 4, mb: 1 }}>
              <Card sx={{ minHeight: { xs: 120, md: 140 } }}>
                <CardHeader
                  title={
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      ALerts
                    </Typography>
                  }
                  subheader={
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary', fontSize: '0.85rem' }}
                    >
                      Current open alerts
                    </Typography>
                  }
                  slotProps={{
                    title: { fontSize: '1rem' },
                    subheader: { fontSize: '0.8rem' },
                  }}
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={4}>
                    <Grid size={6}>
                      <Typography variant={'h4'} align={'center'}>
                        {openCount}
                      </Typography>
                    </Grid>
                    <Grid size={6}>
                      <ErrorIcon color={'error'} fontSize={'large'} />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 3 }} sx={{ px: 4, mb: 1 }}>
              <Card sx={{ minHeight: { xs: 120, md: 140 } }}>
                <CardHeader
                  title={
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Trend
                    </Typography>
                  }
                  subheader={
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary', fontSize: '0.85rem' }}
                    >
                      Relative to yesterday
                    </Typography>
                  }
                  slotProps={{
                    title: { fontSize: '1rem' },
                    subheader: { fontSize: '0.8rem' },
                  }}
                />

                <Divider />
                <CardContent>
                  <Grid container spacing={4}>
                    {/* Left side: show absolute value of trend */}
                    <Grid size={6}>
                      <Typography variant="h4" align="center">
                        {Math.abs(stats?.trend ?? 0)}
                      </Typography>
                    </Grid>

                    {/* Right side: arrow indicates increase or decrease */}
                    <Grid
                      size={6}
                      sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                    >
                      {/* Up arrow for positive trend */}
                      {stats?.trend && stats.trend > 0 && (
                        <ArrowUpwardIcon fontSize="large" color="error" />
                      )}

                      {/* Down arrow for negative trend */}
                      {stats?.trend && stats.trend < 0 && (
                        <ArrowDownwardIcon fontSize="large" color="success" />
                      )}

                      {/* Neutral dash if zero */}
                      {(!stats?.trend || stats.trend === 0) && (
                        <Typography color="text.secondary">–</Typography>
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 3 }} sx={{ px: 4, mb: 1 }}>
              <Card sx={{ minHeight: { xs: 120, md: 140 } }}>
                <CardHeader
                  title={
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {"Today's Violations"}
                    </Typography>
                  }
                  subheader={
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary', fontSize: '0.85rem' }}
                    >
                      Detected today
                    </Typography>
                  }
                  slotProps={{
                    title: { fontSize: '1rem' },
                    subheader: { fontSize: '0.8rem' },
                  }}
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={4}>
                    <Grid size={6}>
                      <Typography variant={'h4'} align={'center'}>
                        {stats?.today ?? 0}
                      </Typography>
                    </Grid>
                    <Grid size={6}>
                      <EventIcon fontSize={'large'} />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 3 }} sx={{ px: 4, mb: 1 }}>
              <Card sx={{ minHeight: { xs: 120, md: 140 } }}>
                <CardHeader
                  title={
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Camera Health
                    </Typography>
                  }
                  subheader={
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary', fontSize: '0.85rem' }}
                    >
                      Online / Total
                    </Typography>
                  }
                  slotProps={{
                    title: { fontSize: '1rem' },
                    subheader: { fontSize: '0.8rem' },
                  }}
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={4}>
                    <Grid size={6}>
                      <Typography variant={'h4'} align={'center'}>
                        1/1
                      </Typography>
                    </Grid>
                    <Grid size={6}>
                      <VideocamIcon fontSize={'large'} />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Divider />
      <Card
        sx={{
          flex: { xs: '0 0 auto', md: 1 },
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Stack direction="row" alignItems={'center'} justifyContent="space-between">
          <CardHeader title="Recent Violations" />
          <Button onClick={() => navigate('/violations')}>view all</Button>
        </Stack>

        <Divider />
        <CardContent sx={{ flex: { md: 1 }, overflow: 'auto' }}>
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
                {visibleRows.slice(0, 10).map((item) => (
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
        </CardContent>
      </Card>
      <ViolationDetailDialog
        open={detailOpen}
        violation={selected}
        onClose={() => setDetailOpen(false)}
        onResolve={handleResolve}
      />
    </Stack>
  );
}
