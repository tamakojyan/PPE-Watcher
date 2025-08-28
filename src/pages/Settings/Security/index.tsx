import { Card, CardContent, CardHeader, Container, Divider, Grid } from '@mui/material';

export default function Security(): React.ReactElement {
  return (
    <Container maxWidth={'md'} sx={{ flex: 1, display: 'flex' }}>
      <Card sx={{ flex: 1 }}>
        <CardHeader title={'Security Settings'} />
        <Divider />
        <CardContent>
          <Grid container sx={{ flex: 1 }} direction="column">
            <Grid size={{ xs: 12 }}>Change password</Grid>
            <Grid size={{ xs: 12 }}>Last login</Grid>
            <Grid size={{ xs: 12 }}>save</Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
}
