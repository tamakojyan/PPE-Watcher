import * as react from 'react';
import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  Grid,
  Stack,
  Card,
  CardHeader,
  CardContent,
  Container,
  Paper,
  Divider,
} from '@mui/material';

const PPE = ['Helmet', 'Mask', 'Reflective Vest', 'Safety Gloves', 'Goggles', 'Safety Boots'];

export default function AlertSettings(): React.ReactElement {
  return (
    <Container maxWidth={'md'} sx={{ flex: 1, display: 'flex' }}>
      <Card sx={{ flex: 1 }}>
        <CardHeader title={'Alert&Notifications Settings'} />
        <Divider />
        <CardContent>
          <Grid container sx={{ flex: 1 }} direction="column">
            <Grid size={{ xs: 12 }}>ppe</Grid>
            <Grid size={{ xs: 12 }}>notification</Grid>
            <Grid size={{ xs: 12 }}>save</Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
}
