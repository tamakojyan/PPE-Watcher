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
  useTheme,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { DateRangePicker } from '@mui/x-date-pickers-pro';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';
import { mockNotifications } from 'mock/notification';
import { useState } from 'react';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { pink } from '@mui/material/colors';

type Notification = {
  id: string;
  message: string;
  kind: 'violation' | 'resolved';
  status: 'read' | 'unread';
  timestamp: string;
  violationId: string;
};
export default function Notifications(): React.ReactElement {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(15);
  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    setRowsPerPage(value);
    setPage(0);
  };
  const visibleRows = mockNotifications.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
            <Typography variant={'h6'}>Notifications</Typography>
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
                    <TableCell>Message</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>ViolationID</TableCell>
                    <TableCell>kind</TableCell>
                    <TableCell>status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visibleRows.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.id}</TableCell>
                      <TableCell>{item.message}</TableCell>
                      <TableCell>{item.timestamp}</TableCell>
                      <TableCell>{item.violationId}</TableCell>
                      <TableCell>{item.kind}</TableCell>
                      <TableCell>{item.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={mockNotifications.length}
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
