import * as react from 'react';
import { Box, Typography, Container, Stack, Link } from '@mui/material';

type Props = { Company: string; Version: string };

export default function Footer({ Company, Version }: Props): React.ReactElement {
  const Year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        borderTop: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Typography variant="caption" color="text.secondary">
            © {Year} {Company}. All rights reserved.
          </Typography>

          <Stack direction="row" spacing={2} alignItems="center">
            {Version && (
              <Typography variant="caption" color="text.secondary">
                v{Version}
              </Typography>
            )}
            <Link href="/privacy" variant="caption" underline="hover" color="text.secondary">
              Privacy Policy
            </Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
