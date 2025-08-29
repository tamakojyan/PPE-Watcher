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
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { mockViolations } from 'mock/violations';
import { useEffect } from 'react';
import ErrorIcon from '@mui/icons-material/Error';
import { useTheme } from '@mui/material/styles';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import RemoveIcon from '@mui/icons-material/Remove';
import VideocamIcon from '@mui/icons-material/Videocam';
import EventIcon from '@mui/icons-material/Event';

export default function Dashboard(): React.ReactElement {
  const navigate = useNavigate();
  const openCount = mockViolations.filter((i) => i.status === 'open').length;
  const resolvedCount = mockViolations.filter((i) => i.status === 'resolved').length;
  const totalCount = mockViolations.length;
  const openViolations = mockViolations.filter((i) => i.status === 'open');
  const theme = useTheme();
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
                  title="Active Alerts"
                  slotProps={{
                    title: { fontSize: '0.9rem' },
                  }}
                ></CardHeader>
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
                  title="Trend"
                  slotProps={{
                    title: { fontSize: '0.9rem' },
                  }}
                ></CardHeader>
                <Divider />
                <CardContent>
                  <Grid container spacing={4}>
                    <Grid size={6}>
                      <Typography variant={'h4'} align={'center'}>
                        {openCount}
                      </Typography>
                    </Grid>
                    <Grid size={6}>
                      <ArrowUpwardIcon fontSize={'large'} color={'error'} />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 3 }} sx={{ px: 4, mb: 1 }}>
              <Card sx={{ minHeight: { xs: 120, md: 140 } }}>
                <CardHeader
                  title="Today's Violations"
                  slotProps={{
                    title: { fontSize: '0.9rem' },
                  }}
                ></CardHeader>
                <Divider />
                <CardContent>
                  <Grid container spacing={4}>
                    <Grid size={6}>
                      <Typography variant={'h4'} align={'center'}>
                        {openCount}
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
                  title="Camera Health"
                  slotProps={{
                    title: { fontSize: '0.9rem' },
                  }}
                ></CardHeader>
                <Divider />
                <CardContent>
                  <Grid container spacing={4}>
                    <Grid size={6}>
                      <Typography variant={'h4'} align={'center'}>
                        1/{openCount}
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
                  <TableCell>Type</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Handler</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Detail</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockViolations.slice(0, 10).map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>{item.timestamp}</TableCell>
                    <TableCell>{item.handler}</TableCell>
                    <TableCell>
                      {item.status === 'open' ? (
                        <Button
                          variant={'contained'}
                          sx={{
                            maxWidth: 100,
                            bgcolor:
                              theme.palette.mode === 'light' ? theme.palette.error.main : '#5f0e06',
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Stack>
  );
}
