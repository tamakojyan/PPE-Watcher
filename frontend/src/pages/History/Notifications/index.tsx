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

import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';
import { mockNotifications } from 'mock/notification';
import { useEffect, useState } from 'react';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { pink } from '@mui/material/colors';
import { Violation } from '@/type';
import api from '../../../api/client';
import HandleNoteAction from '../../../components/HandleNoteAction';
import DateRangePicker from '../../../components/DateRangePicker';
import KeywordSearch from '../../../components/KeywordSearch';
export default function Notifications(): React.ReactElement {
  const [filters, setFilters] = useState<{ from?: number; to?: number; keyword?: string }>({});

  const [refreshTick, setRefreshTick] = useState(0);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(15);
  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    setRowsPerPage(value);
    setPage(0);
  };
  const [total, setTotal] = useState<number>(0);
  // UI-friendly row type for the table and detail panel
  // UI-friendly row type for notifications
  type NotificationRow = {
    id: string; // notification id
    type: string; // notification type (e.g. "violation", "system")
    kind?: string; // violation kind (e.g. "no_helmet")
    status: string; // "unread" | "read"
    createdAtText: string; // human-readable createdAt
    readAtText?: string; // human-readable readAt (if any)
    violationId?: string | null; // linked violation id (optional)
    userId?: string | null; // owner/user id (optional)
    message?: string | null; // message text (optional)
    note?: string | null; // extra note (optional)
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
  function toNotificationRow(n: any): NotificationRow {
    return {
      id: n.id,
      type: String(n.type ?? ''),
      kind: n.kind ? String(n.kind) : undefined,
      status: String(n.status ?? ''),
      createdAtText: formatTs(n.createdAt),
      readAtText: formatTs(n.readAt),
      violationId: n.violationId ?? null,
      userId: n.userId ?? null,
      message: n.message ?? null,
      note: n.note ?? null,
    };
  }
  const [visibleRows, setVisibleRows] = useState<NotificationRow[]>([]);

  useEffect(() => {
    const params: any = {
      page,
      pageSize: rowsPerPage,
      sort: 'createdAt:desc', // 注意：notification 用 createdAt
    };

    if (filters.from) params.from = filters.from;
    if (filters.to) params.to = filters.to;
    if (filters.keyword) params.keyword = filters.keyword;

    api
      .get<{
        items: Notification[];
        total: number;
        skip: number;
        take: number;
      }>('/notifications', params)
      .then((res) => {
        setVisibleRows(res.items.map(toNotificationRow));
        setTotal(res.total);
        console.log(res);
      });
  }, [page, rowsPerPage, filters, refreshTick]);

  const [selected, setSelected] = useState<NotificationRow | null>(null);
  const handleRowClick = (row: NotificationRow) => {
    setSelected(row);
  };

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
              <DateRangePicker
                onChange={({ from, to }) => setFilters((prev) => ({ ...prev, from, to }))}
              />
              <KeywordSearch onSearch={(keyword) => setFilters((prev) => ({ ...prev, keyword }))} />
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12 }} sx={{ flex: 1, minHeight: 0 }}>
        <Card>
          <CardHeader title={'Notification List'} />
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
                    <TableCell>Type</TableCell>

                    <TableCell>Kind</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visibleRows.map((item) => (
                    <>
                      <TableRow key={item.id}>
                        <TableCell>{item.id}</TableCell>
                        <TableCell>{item.message}</TableCell>
                        <TableCell>{item.createdAtText}</TableCell>
                        <TableCell>{item.violationId}</TableCell>
                        <TableCell>{item.type}</TableCell>
                        <TableCell>{item.kind}</TableCell>
                        <TableCell>{item.status}</TableCell>
                        <TableCell>
                          <HandleNoteAction
                            id={item.id}
                            disabled={item.status === 'handled'}
                            setRefreshTick={setRefreshTick} // disable when already handled
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={6}>Note: {item.note ?? 'No note yet'}</TableCell>
                      </TableRow>
                    </>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={total}
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
