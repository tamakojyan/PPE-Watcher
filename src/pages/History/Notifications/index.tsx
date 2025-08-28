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
export default function Notifications(): React.ReactElement {
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
        <Card></Card>
      </Grid>
      <Grid size={{ xs: 12 }}></Grid>
    </Grid>
  );
}
