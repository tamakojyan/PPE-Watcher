import { Card, CardContent, CardHeader, Container, Divider, Grid } from '@mui/material';

export default function Contacts(): React.ReactElement {
  return (
    <Container maxWidth={'md'} sx={{ flex: 1, display: 'flex' }}>
      <Card sx={{ flex: 1 }}>
        <CardHeader title={'Contacts Settings'} />
        <Divider />
        <CardContent>
          <Grid container sx={{ flex: 1 }} direction="column">
            <Grid size={{ xs: 12 }}>table</Grid>
            <Grid size={{ xs: 12 }}>add</Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
}
