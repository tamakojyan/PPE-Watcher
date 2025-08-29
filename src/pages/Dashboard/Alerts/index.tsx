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
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { mockViolations } from '../../../mock/violations';
import { useState } from 'react';
import { useTheme } from '@mui/material';

export default function Alerts(): React.ReactElement {
  const theme = useTheme();
  const openCount = mockViolations.filter((i) => i.status === 'open').length;
  const resolvedCount = mockViolations.filter((i) => i.status === 'resolved').length;
  const totalCount = mockViolations.length;
  const stats = [
    { label: 'Open', value: openCount, icon: <ErrorIcon color="error" /> },
    { label: 'Resolved', value: resolvedCount, icon: <CheckCircleIcon color="success" /> },
    { label: 'Total', value: totalCount, icon: <ListAltIcon color="primary" /> },
  ];
  type violationData = {
    id: number;
    type: string;
    status: string;
    handler: null | string;
    timestamp: string;
    imageUrl: string;
  };
  const [selected, setSelected] = useState<violationData | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(15);
  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    setRowsPerPage(value);
    setPage(0);
  };
  const visibleRows = mockViolations
    .filter((i) => i.status === 'open')
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const handleRowClick = (row: violationData) => {
    setSelected(row);
    console.log(row);
  };

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
          {stats.map((s) => (
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
          <Grid size={{ xs: 12, lg: 3 }} sx={{ minHeight: 0 }}>
            <Paper>
              <TableContainer>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Id</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Time</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {visibleRows.map((row) => (
                      <TableRow
                        key={row.id}
                        hover
                        sx={{
                          cursor: 'pointer',
                          bgcolor:
                            selected?.id === row.id ? theme.palette.action.selected : undefined,
                        }}
                        onClick={() => handleRowClick(row)}
                      >
                        <TableCell>{row.id}</TableCell>
                        <TableCell>{row.type}</TableCell>
                        <TableCell>{row.timestamp}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={mockViolations.filter((i) => i.status === 'open').length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={10}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[15, 30]}
              />
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, lg: 9 }} sx={{ minHeight: 0 }}>
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
                    src={selected?.imageUrl}
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
                          <TableCell>Type</TableCell>
                          <TableCell>Time</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Handler</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>{selected?.id}</TableCell>
                          <TableCell>{selected?.type}</TableCell>
                          <TableCell>{selected?.timestamp}</TableCell>
                          <TableCell>{selected?.status}</TableCell>
                          <TableCell>{selected?.handler}</TableCell>
                          <TableCell align={'center'}>
                            {selected?.status === 'open' ? (
                              <Button
                                variant={'contained'}
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
                                variant={'contained'}
                                disabled
                                sx={{ maxWidth: 100 }}
                                color={'success'}
                              >
                                Resolved
                              </Button>
                            )}
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
