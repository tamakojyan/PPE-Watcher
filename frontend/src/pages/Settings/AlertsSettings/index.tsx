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
  List,
  ListItem,
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
              <Typography sx={{ my: 3 }}> PPE Type</Typography>
              <FormGroup
                row
                sx={{
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  '& .MuiFormControlLabel-root': {
                    flex: { xs: '1 1 100%', md: '1 1 45%' },
                    maxWidth: { xs: '100%', md: '45%' },
                    boxSizing: 'border-box',
                    mx: 1,
                    my: 3,
                  },
                }}
              >
                {PPET.map((item) => (
                  <FormControlLabel key={item} label={item} control={<Checkbox />} />
                ))}
              </FormGroup>
            </Grid>
            <Grid size={{ xs: 12 }} sx={{ my: 3 }}>
              <Typography sx={{ my: 3 }}> Notifications Type</Typography>
              <FormGroup
                row
                sx={{
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  '& .MuiFormControlLabel-root': {
                    flex: { xs: '1 1 100%', md: '1 1 45%' },
                    maxWidth: { xs: '100%', md: '45%' },
                    boxSizing: 'border-box',
                    mx: 1,
                    my: 3,
                  },
                }}
              >
                {['EMAIL', 'SMS'].map((item) => (
                  <FormControlLabel key={item} label={item} control={<Checkbox />} />
                ))}
              </FormGroup>
            </Grid>
            <Grid size={{ xs: 12 }} sx={{ flex: 1 }}>
              <Stack direction={'column'} justifyContent={'center'}>
                <Stack sx={{ my: 4, alignItems: 'center' }}>
                  <Button variant={'contained'}>SAVE</Button>
                </Stack>
                <Stack sx={{ my: 4 }}>
                  <Typography variant={'body1'} sx={{ width: '100%' }}>
                    NOTE:
                  </Typography>
                  <List dense>
                    <ListItem>
                      1.Select at least one PPE type for proper violation detection.
                    </ListItem>
                    <ListItem>
                      2.Select at least one notification method (Email or SMS) to ensure alerts are
                      delivered.
                    </ListItem>
                    <ListItem>
                      3.Saved settings take effect immediately and apply only to future alerts.
                    </ListItem>
                  </List>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
}
