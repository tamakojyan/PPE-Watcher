import { Box } from '@mui/material';

export default function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
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
