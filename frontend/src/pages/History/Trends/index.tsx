import * as react from 'react';
import {
  Chip,
  Grid,
  Stack,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Divider,
  Button,
  Box,
} from '@mui/material';
import { useTheme } from '@mui/material';
import { mockViolations } from 'mock/violations';
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
import { useMemo, useState } from 'react';
type violationData = {
  id: string;
  type: string[];
  status: string;
  handler: null | string;
  timestamp: string;
  imageUrl: string;
};
const allTypes = ['No Mask', 'No Helmet', 'No Vest', 'No Gloves'] as const;
type PPEType = (typeof allTypes)[number];
type bucket = {
  date: string;
  total: number;
  open: number;
  resolved: number;
  byType: Record<PPEType, number>;
};

function groupByDay(violations: violationData[]): bucket[] {
  const map = new Map<string, bucket>();
  for (const v of violations) {
    const d = startOfDay(new Date(v.timestamp));
    const key = format(d, 'yyyy-MM-dd');
    if (!map.has(key)) {
      map.set(key, {
        date: key,
        total: 0,
        open: 0,
        resolved: 0,
        byType: Object.fromEntries(allTypes.map((t) => [t, 0])) as Record<string, number>,
      });
    }
    const bucket = map.get(key)!;
    bucket.total += 1;
    if (v.status === 'open') bucket.open += 1;
    else if (v.status === 'resolved') bucket.resolved += 1;
    v.type.forEach((t) => (bucket.byType[t as PPEType] += 1));
  }
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}
export default function Trends(): React.ReactElement {
  const theme = useTheme();
  const pieColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    theme.palette.success.main,
    theme.palette.error.main,
  ];
  const colorOpen = theme.palette.error.main;
  const colorResolved = theme.palette.success.main;
  const colorTotal = theme.palette.primary.main;
  const buckets = useMemo(() => groupByDay(mockViolations), []);
  const [selected, setSelected] = useState<bucket | null>(buckets.at(-1) ?? null);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const pieData = useMemo(() => {
    if (!selected) return [];
    return Object.entries(selected.byType)
      .map(([name, value]) => ({ name, value }))
      .filter((d) => d.value > 0);
  }, [selected]);
  const CustomHoverTooltip = ({ active, label }: any) => {
    if (active && label) {
      const b = buckets.find((d) => d.date === label);
      if (b && selected?.date !== b.date) {
        setSelected(b);
      }
    }
    return null; // 我们用右侧 details 显示信息，这里隐藏 Tooltip 面板
  };

  return (
    <Grid container sx={{ flex: 1, minHeight: 0, bgcolor: 'background.paper' }} direction="column">
      <Grid size={{ xs: 12 }}>
        <Typography variant={'h6'}>Trends</Typography>
      </Grid>
      <Grid container size={{ xs: 12 }}>
        <Grid
          container
          size={{ xs: 12 }}
          sx={{ borderTop: '1px solid', borderBottom: '1px solid' }}
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
          <Grid size={{ xs: 6, md: 2 }}>
            <Button>Generate</Button>
            <Button>Export</Button>
          </Grid>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Chip label={'TOOlBAR'} />
        </Grid>
      </Grid>
      <Grid container size={{ xs: 12 }} sx={{ flex: 1, minHeight: 0 }}>
        <Grid size={{ xs: 12, md: 8 }} sx={{ borderRight: '1px solid' }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* 柱状图（堆叠：open/resolved） */}
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
