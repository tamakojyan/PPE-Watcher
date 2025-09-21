// src/pages/Login.tsx
import * as React from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { login as loginApi } from '../../api/auth'; // ← use auth API only
import Logo from '../../assets/images/Logo.png';
import { useNavigate } from 'react-router-dom';
type LoginProps = {
  onSuccess?: () => void; // optional: navigate to dashboard after login
  systemName?: string; // app name to display
  logoSrc?: string; // logo image url
  // loginPath?: string;     // no longer needed when using auth.ts
};

export default function Login({ systemName = 'PPE Watcher', logoSrc = Logo }: LoginProps) {
  const navigate = useNavigate();

  // Controlled fields
  const [userId, setUserId] = React.useState('');
  const [password, setPassword] = React.useState('');

  // UI state
  const [showPwd, setShowPwd] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Toggle password visibility
  const togglePwd = () => setShowPwd((v) => !v);

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!userId.trim() || !password) {
      setError('Please enter both ID and password.');
      return;
    }

    setSubmitting(true);
    try {
      // Call auth API; it returns { token } directly (no .data)
      const { token } = await loginApi(userId.trim(), password);

      // Persist token locally for subsequent requests
      localStorage.setItem('token', token);

      // Navigate to dashboard (if provided)
      navigate('/', { replace: true });
    } catch (err: any) {
      // Unify error message (backend may return { message })
      const msg = err?.response?.data?.message ?? err?.message ?? 'Login failed. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        bgcolor: (t) => (t.palette.mode === 'light' ? '#f7f7f7' : 'background.default'),
        p: 2,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: '100%',
          borderRadius: 3,
          p: { xs: 3, sm: 4 },
        }}
      >
        {/* Header: Logo + System name */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Box
            aria-label="logo"
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              bgcolor: (t) => (t.palette.mode === 'light' ? '#eee' : '#222'),
              backgroundImage: logoSrc ? `url(${logoSrc})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              flexShrink: 0,
            }}
          />
          <Box>
            <Typography variant="h5" fontWeight={700} lineHeight={1.2}>
              {systemName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to continue
            </Typography>
          </Box>
        </Box>

        {/* Error banner */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'grid', gap: 2 }}>
          <TextField
            label="User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            autoComplete="username"
            autoFocus
            fullWidth
            required
          />

          <TextField
            label="Password"
            type={showPwd ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            fullWidth
            required
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={togglePwd}
                      aria-label={showPwd ? 'hide password' : 'show password'}
                      edge="end"
                    >
                      {showPwd ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={submitting}
            sx={{ mt: 1, py: 1.2, fontWeight: 700, borderRadius: 2 }}
          >
            {submitting ? 'Signing in…' : 'Sign In'}
          </Button>

          {/* Helper row (optional) */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 0.5,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Forgot password?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Need an account? Contact admin
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
