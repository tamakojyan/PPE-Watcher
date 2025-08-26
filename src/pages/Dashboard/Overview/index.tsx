import * as react from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Dashboard(): React.ReactElement {
  const navigate = useNavigate();
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
          <Grid container direction="row" spacing={1}>
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <Card sx={{ minHeight: { xs: 120, md: 140 } }}>
                <CardHeader title="Active Alerts"></CardHeader>
                <Divider />
                <CardContent></CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <Card sx={{ minHeight: { xs: 120, md: 140 } }}>
                <CardHeader title="Trend"></CardHeader>
                <Divider />
                <CardContent></CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <Card sx={{ minHeight: { xs: 120, md: 140 } }}>
                <CardHeader title="Today's Violations"></CardHeader>
                <Divider />
                <CardContent></CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <Card sx={{ minHeight: { xs: 120, md: 140 } }}>
                <CardHeader title="Camera Health"></CardHeader>
                <Divider />
                <CardContent></CardContent>
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
          <CardHeader title="Recent Violations" />{' '}
          <Button onClick={() => navigate('/violations')}>view all</Button>
        </Stack>

        <Divider />
        <CardContent sx={{ flex: { md: 1 }, overflow: 'auto' }}></CardContent>
      </Card>
    </Stack>
  );
}
