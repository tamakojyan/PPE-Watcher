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
  Button,
  Paper,
  Box,
  Divider,
} from '@mui/material';

const ALERT_STATS = [
  { label: 'Open', value: 1 },
  { label: 'Acknowledge', value: 1 },
  { label: 'Resolved', value: 1 },
  { label: 'Total', value: 3 },
];

export default function Alerts(): React.ReactElement {
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
          {ALERT_STATS.map((i) => (
            <Grid key={i.label} size={{ xs: 12, sm: 4, md: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  bgcolor: 'background.paper',
                  p: 2,
                  border: '1px solid',
                  borderRadius: 2,
                  borderColor: 'divider',
                }}
              >
                <Stack spacing={0.5}>
                  <Typography variant="body2" color={'textSecondary'}>
                    {i.label}
                  </Typography>
                  <Typography variant="h4" color="primary.main" fontWeight={700}>
                    {i.value}
                  </Typography>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Grid>

      <Grid size={{ xs: 12 }} sx={{ flex: 1, minHeight: 0 }}>
        <Grid container sx={{ height: '100%', minHeight: 0 }}>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Paper sx={{ height: '100%' }}>List</Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 9 }} sx={{ minHeight: 0 }}>
            <Stack sx={{ height: '100%', minHeight: 0 }}>
              <Stack sx={{ flex: 8, borderBottom: '1px solid', borderColor: 'grey' }}>
                ScreenShot
              </Stack>
              <Stack sx={{ flex: 4 }}>Table</Stack>
            </Stack>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
