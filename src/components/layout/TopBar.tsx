import { Box } from '@mui/material';
import { JSX } from 'react';

export default function TopBar({ onMenuClick }: { onMenuClick?: () => void }): JSX.Element {
  return (
    <Box
      sx={{
        height: 64,
        bgcolor: 'primary.main',
        display: 'flex',
        color: 'white',
        alignItems: 'center',
        px: 2,
      }}
    ></Box>
  );
}
