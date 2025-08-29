import {
  Card,
  CardContent,
  CardHeader,
  Container,
  Divider,
  Grid,
  Typography,
  Box,
  TextField,
  Button,
  List,
  ListItem,
} from '@mui/material';

export default function SenderConfig(): React.ReactElement {
  return (
    <Container maxWidth={'md'} sx={{ flex: 1, display: 'flex' }}>
      <Card sx={{ flex: 1 }}>
        <CardHeader title={'SenderConfig Settings'} />
        <Divider />
        <CardContent>
          <Box component={'form'}>
            <Grid container spacing={2} direction={'column'} alignItems={'center'}>
              <Grid size={{ xs: 12, md: 6 }}>
                <strong>Email(SMTP)</strong>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label={'Host'} placeholder={'smtp.example.com'} fullWidth />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label={'Port'} placeholder={'smtp.example.com'} fullWidth />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label={'User'} placeholder={'smtp.example.com'} fullWidth />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label={'PassWord'} placeholder={'smtp.example.com'} fullWidth />
              </Grid>
              <Grid
                size={{ xs: 12, md: 6 }}
                sx={{ display: 'flex', justifyContent: 'center', my: 4 }}
              >
                <Button variant={'contained'}>Update Email</Button>
              </Grid>
            </Grid>
          </Box>
          <Divider sx={{ my: 3 }}></Divider>
          <Box component={'form'}>
            <Grid container spacing={2} direction={'column'} alignItems={'center'}>
              <Grid size={{ xs: 12, md: 6 }}>
                <strong>SMS</strong>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label={'Provider'} placeholder={'smtp.example.com'} fullWidth />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label={'SID'} placeholder={'smtp.example.com'} fullWidth />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label={'Token'} placeholder={'smtp.example.com'} fullWidth />
              </Grid>
              <Grid
                size={{ xs: 12, md: 6 }}
                sx={{ display: 'flex', justifyContent: 'center', my: 4 }}
              >
                <Button variant={'contained'}>Update SMS</Button>
              </Grid>
              <Grid size={{ xs: 12 }} sx={{ my: 4 }}>
                <Typography variant={'body1'} sx={{ width: '100%' }}>
                  NOTE:
                </Typography>
                <List dense>
                  <ListItem>
                    1.Make sure the SMTP and SMS settings are filled in correctly before updating.
                  </ListItem>
                  <ListItem>
                    2.At least one valid email address or phone number must be configured in
                    Contacts.
                  </ListItem>
                  <ListItem>3.Incorrect settings may cause alerts to fail to send.</ListItem>
                </List>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
