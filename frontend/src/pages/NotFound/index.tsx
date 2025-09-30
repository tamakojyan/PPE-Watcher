// src/pages/NotFound.tsx
import * as React from 'react';
import { Box, Button, Container, Paper, Stack, Typography, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SearchOffRoundedIcon from '@mui/icons-material/SearchOffRounded';

export default function NotFound(): React.ReactElement {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Container
      maxWidth="md"
      sx={{
        // Ensure full height minus top bar (adjust if your top bar height differs)
        minHeight: 'calc(100dvh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Stack spacing={4} alignItems="center" sx={{ width: '100%' }}>
        {/* Main card with illustration and text */}
        <Paper
          elevation={0}
          variant="outlined"
          sx={{
            width: '100%',
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            bgcolor: theme.palette.mode === 'light' ? 'background.paper' : 'background.default',
            borderColor: theme.palette.mode === 'light' ? 'divider' : 'rgba(255,255,255,0.12)',
          }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={4}
            alignItems="center"
            justifyContent="space-between"
          >
            {/* Simple themed illustration block */}
            <Box
              aria-hidden
              sx={{
                flexShrink: 0,
                width: { xs: '100%', md: 280 },
                height: { xs: 160, md: 200 },
                borderRadius: 3,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}22 0%, ${theme.palette.secondary.main}22 100%)`,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  inset: 16,
                  borderRadius: 2,
                  border: `2px dashed ${
                    theme.palette.mode === 'light'
                      ? theme.palette.primary.light
                      : theme.palette.primary.dark
                  }`,
                }}
              />
              <SearchOffRoundedIcon
                sx={{
                  position: 'absolute',
                  right: 16,
                  bottom: 16,
                  fontSize: 48,
                  color:
                    theme.palette.mode === 'light'
                      ? theme.palette.text.secondary
                      : theme.palette.text.disabled,
                }}
              />
            </Box>

            {/* Text and action buttons */}
            <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="h3"
                fontWeight={800}
                sx={{
                  letterSpacing: 0.2,
                  lineHeight: 1.1,
                  fontSize: { xs: 28, md: 36 },
                }}
              >
                404 Not Found
              </Typography>

              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 640 }}>
                Sorry, the page you are looking for doesn’t exist, has been moved, or you don’t have
                permission to access it. Please check the URL or return to the homepage.
              </Typography>

              {/* Action buttons: back to home / back to previous */}
              <Stack direction="row" spacing={2} sx={{ pt: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<HomeRoundedIcon />}
                  onClick={() => navigate('/')}
                >
                  Back to Home
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackRoundedIcon />}
                  onClick={() => navigate(-1)}
                >
                  Go Back
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </Paper>

        {/* Optional footer hint */}
        <Typography variant="caption" color="text.secondary" align="center">
          If you reached this page via a bookmark or external link, the link may be outdated. Please
          use the main navigation instead.
        </Typography>
      </Stack>
    </Container>
  );
}
