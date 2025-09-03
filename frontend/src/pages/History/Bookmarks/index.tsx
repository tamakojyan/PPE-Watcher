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
import { useTheme } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { DateRangePicker } from '@mui/x-date-pickers-pro';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';
import { mockViolations } from '../../../mock/violations';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { pink } from '@mui/material/colors';
import { useState } from 'react';

export default function Bookmarks(): React.ReactElement {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(15);
  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    setRowsPerPage(value);
    setPage(0);
  };
  const visibleRows = mockViolations.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const theme = useTheme();
  return (
    <Grid
      container
      sx={{ flex: 1, minHeight: 0, bgcolor: 'background.paper' }}
      direction={'column'}
    >
      <Grid size={{ xs: 12 }}>
        <Grid container>
          <Grid size={{ xs: 6, md: 10 }}>
            <Typography variant={'h6'}>Bookmarks</Typography>
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
          <CardHeader title="ToolBar" />
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
        <Card>
          <CardHeader title={'Bookmarks List'} />
          <Divider />
          <CardContent>
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
                      <TableCell>{item.type.join(',')}</TableCell>
                      <TableCell>{item.timestamp}</TableCell>
                      <TableCell>{item.handler}</TableCell>
                      <TableCell>
                        {item.status === 'open' ? (
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
                        <Button sx={{ maxWidth: 100 }} variant={'contained'}>
                          Detail
                        </Button>
                      </TableCell>
                      <TableCell>
                        <IconButton>
                          <FavoriteIcon
                            sx={{
                              color: theme.palette.mode === 'light' ? pink[500] : pink[100],
                            }}
                          />
                        </IconButton>
                      </TableCell>
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
    </Grid>
  );
}
