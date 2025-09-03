import * as react from 'react';
import {
  Grid,
  Stack,
  Button,
  TextField,
  Table,
  TableBody,
  TableHead,
  TableContainer,
  TablePagination,
  TableCell,
  TableRow,
  TableFooter,
  TableSortLabel,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
  inputAdornmentClasses,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { DateRangePicker } from '@mui/x-date-pickers-pro';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';
import { mockViolations } from '../../../mock/violations';
import { useState } from 'react';
import { useTheme } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { pink } from '@mui/material/colors';

export default function SearchViolations(): React.ReactElement {
  type violationData = {
    id: string;
    type: string[];
    status: string;
    handler: null | string;
    timestamp: string;
    imageUrl: string;
  };
  const theme = useTheme();
  const [selected, setSelected] = useState<violationData | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(15);
  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    setRowsPerPage(value);
    setPage(0);
  };
  const visibleRows = mockViolations.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const handleRowClick = (row: violationData) => {
    setSelected(row);
    console.log(row);
  };
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
            <Button> Export</Button>
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
              <Grid size={{ md: 3 }}>DatePicker</Grid>
              <Grid size={{ md: 6 }}>
                <TextField
                  sx={{ width: '100%' }}
                  label="Search"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position={'end'}>
                          <IconButton>
                            <ClearIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                ></TextField>
              </Grid>
              <Grid size={{ md: 3 }}>
                <Button
                  variant={'contained'}
                  sx={{
                    mt: 1,
                    boxShadow: 'none',
                    transition: 'box-shadow 0.3 ease-in-out',
                    '&:hover': { boxShadow: 6 },
                  }}
                >
                  Search
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12 }} sx={{ flex: 1, minHeight: 0 }}>
        <Grid container sx={{ height: '100%', minHeight: 0 }} spacing={1}>
          <Grid size={{ xs: 12, lg: 8 }}>
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
                          <TableCell>{row.type.join(',')}</TableCell>
                          <TableCell>{row.timestamp}</TableCell>
                          <TableCell>{row.handler}</TableCell>
                          <TableCell>{row.status}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  component="div"
                  count={mockViolations.length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[15, 30]}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Card sx={{ height: { xs: 'auto', md: '100%' }, border: '1px solid' }}>
              <CardHeader
                title={'Details'}
                slotProps={{
                  title: {
                    variant: 'body1',
                  },
                }}
              />
              <Divider />
              <CardContent
                sx={{
                  display: 'flex',
                  height: { xs: 'auto', md: '100%' },
                  minHeight: 0,
                  flexDirection: 'column',
                }}
              >
                <Stack
                  sx={{
                    flex: 8,
                    border: '1px solid',
                    justifyContent: 'center',
                    alignItems: 'center',
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
                <Stack sx={{ flex: 4 }}>
                  {selected ? (
                    <TableContainer sx={{ minHeight: '100px' }}>
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
                            <TableCell>{selected?.type.join(',')}</TableCell>

                            <TableCell>{selected?.timestamp}</TableCell>
                            <TableCell>{selected?.status}</TableCell>
                            <TableCell>{selected?.handler}</TableCell>
                            <TableCell>
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
                            <TableCell>
                              <IconButton>
                                <FavoriteBorderIcon
                                  sx={{
                                    color: theme.palette.mode === 'light' ? pink[500] : pink[100],
                                  }}
                                />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography> Click A row to preview</Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
