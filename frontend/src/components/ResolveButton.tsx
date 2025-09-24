// src/components/ResolveButton.tsx
import { Button } from '@mui/material';
import api from '../api/client';
import { useTheme } from '@mui/material/styles';

type ResolveButtonProps = {
  violationId: string;
  status?: string;
  onResolved?: (updated?: any) => void; // optional callback with updated record
};

export default function ResolveButton({ violationId, status, onResolved }: ResolveButtonProps) {
  const theme = useTheme();

  async function handleClick() {
    if (status === 'resolved') return;

    const updated = await api.patch(`/violations/${violationId}/resolve`);

    if (onResolved) onResolved(updated);
  }

  return status === 'open' ? (
    <Button
      variant="contained"
      sx={{
        maxWidth: 100,
        bgcolor: theme.palette.mode === 'light' ? theme.palette.error.main : '#5f0e06',
      }}
      onClick={handleClick}
    >
      Resolve
    </Button>
  ) : (
    <Button variant="contained" disabled sx={{ maxWidth: 100 }} color="success">
      Resolved
    </Button>
  );
}
