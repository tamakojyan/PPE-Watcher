import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Divider,
  Grid,
  TextField,
  List,
  ListItem,
  ListItemText,
  useTheme,
  Typography,
} from '@mui/material';

export default function Security(): React.ReactElement {
  const theme = useTheme();
  return (
    <Container maxWidth={'md'} sx={{ flex: 1, display: 'flex' }}>
      <Card sx={{ flex: 1 }}>
        <CardHeader title={'Security Settings'} />
        <Divider />
        <CardContent>
          <Box component={'form'}>
            <Grid container spacing={2} direction={'column'} alignItems={'center'}>
              <Grid size={{ xs: 12, md: 6 }}>
                <strong>Change Password</strong>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label={'Current Password'} placeholder={'smtp.example.com'} fullWidth />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label={'New Password'} placeholder={'smtp.example.com'} fullWidth />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label={'Confirm Password'} placeholder={'smtp.example.com'} fullWidth />
              </Grid>
              <Grid
                size={{ xs: 12, md: 6 }}
                sx={{ display: 'flex', justifyContent: 'center', my: 4 }}
              >
                <Button variant={'contained'}>Update Password</Button>
              </Grid>
            </Grid>
          </Box>
          <List sx={{ my: 4 }}>
            <ListItem sx={{ bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100' }}>
              <ListItemText primary={'Last Login'} secondary={'2025-08-28 18:32'}></ListItemText>
            </ListItem>
            <ListItem sx={{ bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100' }}>
              <ListItemText
                primary={'Last Password Change'}
                secondary={'2025-08-28 18:32'}
              ></ListItemText>
            </ListItem>
          </List>
          <Typography variant={'body1'} sx={{ width: '100%' }}>
            NOTE:
          </Typography>
          <List dense>
            <ListItem>
              1.Password must be at least 8 characters and include upper/lower case and a number..
            </ListItem>
            <ListItem>
              2.You’ll be signed out on other devices after updating the password.
            </ListItem>
            <ListItem>
              3.If your account is managed by SSO/IT, please contact your administrator to reset
              your password.
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </Container>
  );
}
