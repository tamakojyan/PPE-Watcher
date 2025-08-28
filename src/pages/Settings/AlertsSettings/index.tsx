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
  Typography,
  Button,
} from '@mui/material';

const PPET: string[] = [
  'Helmet',
  'Mask',
  'Reflective Vest',
  'Safety Gloves',
  'Goggles',
  'Safety Boots',
];

export default function AlertSettings(): React.ReactElement {
  return (
    <Container maxWidth={'md'} sx={{ flex: 1, display: 'flex' }}>
      <Card sx={{ flex: 1 }}>
        <CardHeader title={'Alert&Notifications Settings'} />
        <Divider />
        <CardContent>
          <Grid container sx={{ flex: 1 }} direction="column">
            <Grid size={{ xs: 12 }}>
              <Typography> PPE Type</Typography>
              <FormGroup
                row
                sx={{
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  '& .MuiFormControlLabel-root': {
                    width: { xs: '100%', md: '45%' },
                    mx: 1,
                  },
                }}
              ></FormGroup>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography> Notifications Type</Typography>
              <Grid container spacing={1}>
                <FormGroup>
                  <Grid container spacing={2} justifyContent={'center'} alignItems={'center'}>
                    {['EMAIL', 'SMS'].map((p, index) => (
                      <Grid key={p} size={{ xs: 12, md: 6 }}>
                        <FormControlLabel label={p} control={<Checkbox />} />
                      </Grid>
                    ))}
                  </Grid>
                </FormGroup>
              </Grid>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Grid container justifyContent={'center'} sx={{ mt: 4 }}>
                <Button>SAVE</Button>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
}
