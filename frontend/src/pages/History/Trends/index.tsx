import * as react from 'react';
import { Chip, Grid, Stack, Typography, Divider, Button, Box } from '@mui/material';
import { useTheme } from '@mui/material';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format, startOfDay } from 'date-fns';
import { useContext, useEffect, useMemo, useState } from 'react';
import { Violation } from '@/type';
import api from '../../../api/client';
import DateRangePicker from '../../../components/DateRangePicker';
import { RefreshContext } from '../../../components/layout/AppShell';

// ---- Types for chart buckets ----
const allTypes = ['no_mask', 'no_helmet', 'no_vest', 'no_gloves'] as const;
type PPEType = (typeof allTypes)[number];

type Bucket = {
  date: string; // yyyy-MM-dd
  total: number;
  open: number;
  resolved: number;
  byType: Record<PPEType, number>;
};

// ---- Build UI row (optional, if your page still shows a table etc.) ----

// ---- Aggregate by day from RAW violations ----
function groupByDay(list: Violation[]): Bucket[] {
  const map = new Map<string, Bucket>();

  for (const v of list) {
    // normalize to local day
    const d = startOfDay(new Date(v.ts));
    const key = format(d, 'yyyy-MM-dd');

    if (!map.has(key)) {
      map.set(key, {
        date: key,
        total: 0,
        open: 0,
        resolved: 0,
        byType: Object.fromEntries(allTypes.map((t) => [t, 0])) as Record<PPEType, number>,
      });
    }

    const b = map.get(key)!;
    b.total += 1;
    if (v.status === 'open') b.open += 1;
    else if (v.status === 'resolved') b.resolved += 1;

    for (const k of v.kinds ?? []) {
      const t = k.type as PPEType;
      if (t in b.byType) b.byType[t] += 1;
    }
  }

  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export default function Trends(): React.ReactElement {
  const { tick } = useContext(RefreshContext);

  const [dateRange, setDateRange] = useState<{ from?: number; to?: number }>({});

  const theme = useTheme();

  // Keep RAW violations for aggregation
  const [violations, setViolations] = useState<Violation[]>([]);
  // Fetch once
  useEffect(() => {
    (async () => {
      const res = await api.get<{ items: Violation[]; total: number; skip: number; take: number }>(
        '/violations',
        {
          skip: 0,
          take: 1000,
          sort: 'ts:desc',
          ...(dateRange.from ? { from: dateRange.from } : {}),
          ...(dateRange.to ? { to: dateRange.to } : {}),
        }
      );
      setViolations(res.items);
      console.log(res.items);
    })();
  }, [dateRange, tick]);

  // Aggregate buckets from RAW data
  const buckets = useMemo(() => groupByDay(violations), [violations]);

  // Selected day (default: last bucket if exists)
  const [selected, setSelected] = useState<Bucket | null>(null);
  useEffect(() => {
    if (buckets.length) setSelected(buckets[buckets.length - 1]);
    else setSelected(null);
  }, [buckets]);

  // Chart type switch
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  // Pie data based on selected day
  const pieData = useMemo(() => {
    if (!selected) return [];
    return Object.entries(selected.byType)
      .map(([name, value]) => ({ name, value }))
      .filter((d) => d.value > 0);
  }, [selected]);

  // Colors
  const colorOpen = theme.palette.error.main;
  const colorResolved = theme.palette.success.main;
  const colorTotal = theme.palette.primary.main;
  const pieColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    theme.palette.success.main,
    theme.palette.error.main,
  ];

  // Tooltip component to update selected day on hover
  function CustomHoverTooltip({ active, label }: { active?: boolean; label?: string }) {
    if (active && label) {
      const b = buckets.find((d) => d.date === label);
      if (b && b.date !== selected?.date) setSelected(b);
    }
    return null;
  }
  return (
    <Grid container sx={{ flex: 1, minHeight: 0, bgcolor: 'background.paper' }} direction="column">
      <Grid size={{ xs: 12 }}>
        <Typography variant={'h6'}>Trends</Typography>
      </Grid>
      <Grid container size={{ xs: 12 }}>
        <Grid
          container
          size={{ xs: 12 }}
          sx={{ borderTop: '1px solid', borderBottom: '1px solid', mb: 2 }}
        >
          <Grid size={{ xs: 6, md: 10 }}>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <Button
                variant={chartType === 'line' ? 'contained' : 'outlined'}
                onClick={() => setChartType('line')}
              >
                Line Chart
              </Button>
              <Button
                variant={chartType === 'bar' ? 'contained' : 'outlined'}
                onClick={() => setChartType('bar')}
              >
                Bar Chart
              </Button>
            </Stack>
          </Grid>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Grid container spacing={2}>
            <DateRangePicker onChange={({ from, to }) => setDateRange({ from, to })} />
          </Grid>
        </Grid>
      </Grid>
      <Grid container size={{ xs: 12 }} sx={{ flex: 1, minHeight: 0 }}>
        <Grid size={{ xs: 12, md: 8 }} sx={{ borderRight: '1px solid' }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ height: '700px', pt: '150px' }}>
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'line' ? (
                  <LineChart data={buckets} margin={{ top: 8, right: 16, bottom: 12, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.25} />
                    <XAxis
                      dataKey="date"
                      height={40}
                      angle={-30}
                      textAnchor="end"
                      interval={0}
                      tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                      axisLine={{ stroke: theme.palette.divider }}
                      tickLine={{ stroke: theme.palette.divider }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                      axisLine={{ stroke: theme.palette.divider }}
                      tickLine={{ stroke: theme.palette.divider }}
                    />
                    <Tooltip content={<CustomHoverTooltip />} />
                    <Legend verticalAlign="top" height={24} />
                    <Line
                      type="monotone"
                      dataKey="open"
                      name="Open"
                      stroke={colorOpen}
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="resolved"
                      name="Resolved"
                      stroke={colorResolved}
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      name="Total"
                      stroke={colorTotal}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                ) : (
                  <BarChart
                    data={buckets}
                    margin={{ top: 8, right: 16, bottom: 12, left: 0 }}
                    barGap={6}
                  >
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.25} />
                    <XAxis
                      dataKey="date"
                      height={40}
                      angle={-30}
                      textAnchor="end"
                      interval="preserveEnd"
                      tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                      axisLine={{ stroke: theme.palette.divider }}
                      tickLine={{ stroke: theme.palette.divider }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                      axisLine={{ stroke: theme.palette.divider }}
                      tickLine={{ stroke: theme.palette.divider }}
                    />
                    <Tooltip content={<CustomHoverTooltip />} />
                    <Legend verticalAlign="top" height={24} />
                    <Bar dataKey="open" name="Open" fill={colorOpen} />
                    <Bar dataKey="resolved" name="Resolved" fill={colorResolved} />
                    <Bar dataKey="total" name="Total" fill={colorTotal} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </Box>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Box
            sx={{
              height: '100%',
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 2,
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <Typography variant="subtitle1">Details</Typography>
            <Divider />

            {selected ? (
              <>
                <Typography variant="body2" color="text.secondary">
                  Date
                </Typography>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {selected.date}
                </Typography>

                <Stack direction="row" spacing={2} sx={{ my: 1 }}>
                  <Stack>
                    <Typography variant="caption" color="text.secondary">
                      Total
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {selected.total}
                    </Typography>
                  </Stack>
                  <Stack>
                    <Typography variant="caption" color="text.secondary">
                      Open
                    </Typography>
                    <Typography variant="h6" sx={{ color: colorOpen }}>
                      {selected.open}
                    </Typography>
                  </Stack>
                  <Stack>
                    <Typography variant="caption" color="text.secondary">
                      Resolved
                    </Typography>
                    <Typography variant="h6" sx={{ color: colorResolved }}>
                      {selected.resolved}
                    </Typography>
                  </Stack>
                </Stack>

                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2">By Type</Typography>

                {/* 饼图区域占满剩余高度 */}
                <Box sx={{ flex: 1, minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={28} />
                      <Pie data={pieData} dataKey="value" nameKey="name" outerRadius="80%" label>
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={pieColors[i % pieColors.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </>
            ) : (
              <Typography color="text.secondary">Hover a day to see details</Typography>
            )}
          </Box>
        </Grid>
      </Grid>
    </Grid>
  );
}
