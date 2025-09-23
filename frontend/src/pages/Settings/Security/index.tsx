// src/pages/Security/index.tsx
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
import { useState, useEffect } from 'react';
import api from '../../../api/client';

export default function Security(): React.ReactElement {
  const theme = useTheme();

  // --- State for form inputs ---
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // --- State for last login and password change times ---
  const [lastLoginAt, setLastLoginAt] = useState<string | null>(null);
  const [lastPasswordChangeAt, setLastPasswordChangeAt] = useState<string | null>(null);

  // Fetch user security info when page loads
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<{
          lastLoginAt: string | null;
          lastPasswordChangeAt: string | null;
        }>('/me/security');
        setLastLoginAt(res.lastLoginAt);
        setLastPasswordChangeAt(res.lastPasswordChangeAt);
      } catch (err) {
        console.error('Failed to fetch security info', err);
      }
    })();
  }, []);

  // --- Handle password update ---
  const handleChangePassword = async () => {
    // Check new password confirmation
    if (newPassword !== confirmPassword) {
      alert('New password and confirm password do not match.');
      return;
    }
    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters long.');
      return;
    }

    try {
      const res = await api.post<{ success: boolean }>('/me/change-password', {
        currentPassword,
        newPassword,
      });
      if (res.success) {
        alert('Password updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setLastPasswordChangeAt(new Date().toISOString()); // update UI
      } else {
        alert('Password update failed.');
      }
    } catch (err) {
      alert('Invalid current password or server error.');
    }
  };

  // --- Date formatter ---
  function formatDate(d?: string | null) {
    if (!d) return '-';
    return new Date(d).toLocaleString();
  }

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
                <TextField
                  label={'Current Password'}
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label={'New Password'}
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label={'Confirm Password'}
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid
                size={{ xs: 12, md: 6 }}
                sx={{ display: 'flex', justifyContent: 'center', my: 4 }}
              >
                <Button variant={'contained'} onClick={handleChangePassword}>
                  Update Password
                </Button>
              </Grid>
            </Grid>
          </Box>

          <List sx={{ my: 4 }}>
            <ListItem sx={{ bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100' }}>
              <ListItemText primary={'Last Login'} secondary={formatDate(lastLoginAt)} />
            </ListItem>
            <ListItem sx={{ bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100' }}>
              <ListItemText
                primary={'Last Password Change'}
                secondary={formatDate(lastPasswordChangeAt)}
              />
            </ListItem>
          </List>

          <Typography variant={'body1'} sx={{ width: '100%' }}>
            NOTE:
          </Typography>
          <List dense>
            <ListItem>
              1. Password must be at least 8 characters and include upper/lower case and a number.
            </ListItem>
            <ListItem>
              2. You’ll be signed out on other devices after updating the password.
            </ListItem>
            <ListItem>
              3. If your account is managed by SSO/IT, please contact your administrator to reset
              your password.
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </Container>
  );
}
