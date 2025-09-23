import * as React from 'react';
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
  Divider,
  Typography,
  Button,
  List,
  ListItem,
} from '@mui/material';
import { useState, useEffect } from 'react';
import api from '../../../api/client';

// Available PPE types
const PPE_TYPES: string[] = [
  'Helmet',
  'Mask',
  'Reflective Vest',
  'Safety Gloves',
  'Goggles',
  'Safety Boots',
];

// Available Notification types
const NOTIFICATION_TYPES: string[] = ['EMAIL', 'SMS'];

export default function AlertSettings(): React.ReactElement {
  const [selectedPPE, setSelectedPPE] = useState<string[]>([]);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Load config from backend
  useEffect(() => {
    setLoading(true);
    api
      .get<Record<string, any>>('/config')
      .then((data) => {
        setSelectedPPE(data.ppe_types || []);
        setSelectedNotifications(data.notification_types || []);
      })
      .finally(() => setLoading(false));
  }, []);

  // Handle PPE toggle
  const handlePPEChange = (item: string) => {
    setSelectedPPE((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  // Handle Notification toggle
  const handleNotificationChange = (item: string) => {
    setSelectedNotifications((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  // Save to backend
  const handleSave = async () => {
    setLoading(true);
    try {
      await api.post<{ success: boolean }>('/config', {
        ppe_types: selectedPPE,
        notification_types: selectedNotifications,
      });
      alert('Settings saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth={'md'} sx={{ flex: 1, display: 'flex' }}>
      <Card sx={{ flex: 1 }}>
        <CardHeader title={'Alert & Notifications Settings'} />
        <Divider />
        <CardContent>
          <Grid container sx={{ flex: 1 }} direction="column">
            {/* PPE Type Selection */}
            <Grid size={{ xs: 12 }}>
              <Typography sx={{ my: 3 }}>PPE Type</Typography>
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
                {PPE_TYPES.map((item) => (
                  <FormControlLabel
                    key={item}
                    label={item}
                    control={
                      <Checkbox
                        checked={selectedPPE.includes(item)}
                        onChange={() => handlePPEChange(item)}
                      />
                    }
                  />
                ))}
              </FormGroup>
            </Grid>

            {/* Notification Type Selection */}
            <Grid size={{ xs: 12 }} sx={{ my: 3 }}>
              <Typography sx={{ my: 3 }}>Notifications Type</Typography>
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
                {NOTIFICATION_TYPES.map((item) => (
                  <FormControlLabel
                    key={item}
                    label={item}
                    control={
                      <Checkbox
                        checked={selectedNotifications.includes(item)}
                        onChange={() => handleNotificationChange(item)}
                      />
                    }
                  />
                ))}
              </FormGroup>
            </Grid>

            {/* Save button and Notes */}
            <Grid size={{ xs: 12 }} sx={{ flex: 1 }}>
              <Stack direction={'column'} justifyContent={'center'}>
                <Stack sx={{ my: 4, alignItems: 'center' }}>
                  <Button variant={'contained'} onClick={handleSave} disabled={loading}>
                    {loading ? 'Saving...' : 'SAVE'}
                  </Button>
                </Stack>
                <Stack sx={{ my: 4 }}>
                  <Typography variant={'body1'} sx={{ width: '100%' }}>
                    NOTE:
                  </Typography>
                  <List dense>
                    <ListItem>
                      1. Select at least one PPE type for proper violation detection.
                    </ListItem>
                    <ListItem>
                      2. Select at least one notification method (Email or SMS) to ensure alerts are
                      delivered.
                    </ListItem>
                    <ListItem>
                      3. Saved settings take effect immediately and apply only to future alerts.
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
