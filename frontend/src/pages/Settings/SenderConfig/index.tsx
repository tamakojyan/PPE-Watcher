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
import { useState, useEffect } from 'react';
import api from '../../../api/client';

export default function SenderConfig(): React.ReactElement {
  // Email configs
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [smtpSender, setSmtpSender] = useState('');
  // SMS configs
  const [smsProvider, setSmsProvider] = useState('');
  const [smsSid, setSmsSid] = useState('');
  const [smsToken, setSmsToken] = useState('');
  const [smsFrom, setSmsFrom] = useState(''); // ✅ new field for sender number

  const [loading, setLoading] = useState(false);

  // Load config from backend
  useEffect(() => {
    api.get<Record<string, any>>('/config').then((data) => {
      setSmtpHost(data.smtp_host || '');
      setSmtpPort(data.smtp_port || '');
      setSmtpUser(data.smtp_user || '');
      setSmtpPassword(data.smtp_password || '');
      setSmsProvider(data.sms_provider || '');
      setSmsSid(data.sms_sid || '');
      setSmsToken(data.sms_token || '');
      setSmsFrom(data.sms_from || '');
      setSmtpSender(data.smtp_sender || '');
    });
  }, []);

  // Save Email settings
  const handleSaveEmail = async () => {
    setLoading(true);
    try {
      await api.post<{ success: boolean }>('/config', {
        smtp_host: smtpHost,
        smtp_port: smtpPort,
        smtp_user: smtpUser,
        smtp_password: smtpPassword,
        smtp_sender: smtpSender,
      });
      alert('Email settings updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update Email settings');
    } finally {
      setLoading(false);
    }
  };

  // Save SMS settings
  const handleSaveSMS = async () => {
    setLoading(true);
    try {
      await api.post<{ success: boolean }>('/config', {
        sms_provider: smsProvider,
        sms_sid: smsSid,
        sms_token: smsToken,
        sms_from: smsFrom,
      });
      alert('SMS settings updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update SMS settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth={'md'} sx={{ flex: 1, display: 'flex' }}>
      <Card sx={{ flex: 1 }}>
        <CardHeader title={'SenderConfig Settings'} />
        <Divider />
        <CardContent>
          {/* ===================== Email config ===================== */}
          <Box component={'form'}>
            <Grid container spacing={2} direction={'column'} alignItems={'center'}>
              <Grid size={{ xs: 12, md: 6 }}>
                <strong>Email (SMTP)</strong>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label={'Host'}
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  placeholder={'smtp.example.com'}
                  fullWidth
                />
                <Typography variant="caption" color="text.secondary">
                  example: smtp.sendgrid.net
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label={'Port'}
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(e.target.value)}
                  placeholder={'465'}
                  fullWidth
                />
                <Typography variant="caption" color="text.secondary">
                  example: 465 (SSL) or 587 (TLS)
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label={'User'}
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                  placeholder={'user@example.com'}
                  fullWidth
                />
                <Typography variant="caption" color="text.secondary">
                  example: no-reply@yourdomain.com
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label={'Password'}
                  type="password"
                  value={smtpPassword}
                  onChange={(e) => setSmtpPassword(e.target.value)}
                  placeholder={'********'}
                  fullWidth
                />
                <Typography variant="caption" color="text.secondary">
                  example: API key or SMTP password
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label={'Sender Email'}
                  value={smtpSender}
                  onChange={(e) => setSmtpSender(e.target.value)}
                  placeholder={'noreply@yourdomain.com'}
                  fullWidth
                />
                <Typography variant="caption" color="text.secondary">
                  example: noreply@yourdomain.com
                </Typography>
              </Grid>
              <Grid
                size={{ xs: 12, md: 6 }}
                sx={{ display: 'flex', justifyContent: 'center', my: 4 }}
              >
                <Button variant={'contained'} onClick={handleSaveEmail} disabled={loading}>
                  {loading ? 'Saving...' : 'Update Email'}
                </Button>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* ===================== SMS config ===================== */}
          <Box component={'form'}>
            <Grid container spacing={2} direction={'column'} alignItems={'center'}>
              <Grid size={{ xs: 12, md: 6 }}>
                <strong>SMS</strong>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label={'Provider'}
                  value={smsProvider}
                  onChange={(e) => setSmsProvider(e.target.value)}
                  placeholder={'twilio'}
                  fullWidth
                />
                <Typography variant="caption" color="text.secondary">
                  example: twilio
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label={'SID'}
                  value={smsSid}
                  onChange={(e) => setSmsSid(e.target.value)}
                  placeholder={'ACxxxx'}
                  fullWidth
                />
                <Typography variant="caption" color="text.secondary">
                  example: ACXXXXXXXXXXXXXXXXXXXXXXXXXXXX
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label={'Token'}
                  value={smsToken}
                  onChange={(e) => setSmsToken(e.target.value)}
                  placeholder={'xxxxxx'}
                  fullWidth
                />
                <Typography variant="caption" color="text.secondary">
                  example: your_auth_token
                </Typography>
              </Grid>
              {/*  New field: From Number */}
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label={'From Number'}
                  value={smsFrom}
                  onChange={(e) => setSmsFrom(e.target.value)}
                  placeholder={'+1234567890'}
                  fullWidth
                />
                <Typography variant="caption" color="text.secondary">
                  example: +15005550006 (Twilio phone number)
                </Typography>
              </Grid>
              <Grid
                size={{ xs: 12, md: 6 }}
                sx={{ display: 'flex', justifyContent: 'center', my: 4 }}
              >
                <Button variant={'contained'} onClick={handleSaveSMS} disabled={loading}>
                  {loading ? 'Saving...' : 'Update SMS'}
                </Button>
              </Grid>

              {/* Note section */}
              <Grid size={{ xs: 12 }} sx={{ my: 4 }}>
                <Typography variant={'body1'} sx={{ width: '100%' }}>
                  NOTE:
                </Typography>
                <List dense>
                  <ListItem>
                    1. Make sure the SMTP and SMS settings are filled in correctly before updating.
                  </ListItem>
                  <ListItem>
                    2. At least one valid email address or phone number must be configured in
                    Contacts.
                  </ListItem>
                  <ListItem>3. Incorrect settings may cause alerts to fail to send.</ListItem>
                </List>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
