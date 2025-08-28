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
} from '@mui/material';

export default function Trends(): React.ReactElement {
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
          <Grid size={{ xs: 6, md: 10 }}>ToolBar</Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <Button>Create</Button>
            <Button>Export</Button>
          </Grid>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Chip label={'TOOlBAR'} />
        </Grid>
      </Grid>
      <Grid container size={{ xs: 12 }} sx={{ flex: 1, minHeight: 0 }}>
        <Grid size={{ xs: 12, md: 10 }} sx={{ borderRight: '1px solid' }}>
          Chart
        </Grid>
        <Grid size={{ xs: 12, md: 2 }}>details</Grid>
      </Grid>
    </Grid>
  );
}
