// src/components/ViolationDetailDialog.tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  Divider,
} from '@mui/material';
import { Violation } from '@/type';

type Props = {
  open: boolean;
  violation: Violation | null;
  onClose: () => void;
  onResolve?: (id: string) => void;
};

export default function ViolationDetailDialog({ open, violation, onClose, onResolve }: Props) {
  if (!violation) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Violation Detail</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography>
            <strong>ID:</strong> {violation.id}
          </Typography>
          <Typography>
            <strong>Types:</strong> {(violation.kinds ?? []).map((k) => k.type).join(', ')}
          </Typography>
          <Typography>
            <strong>Status:</strong> {violation.status}
          </Typography>
          <Typography>
            <strong>Timestamp:</strong> {new Date(violation.ts).toLocaleString()}
          </Typography>
          {violation.handler && (
            <Typography>
              <strong>Handler:</strong> {violation.handler}
            </Typography>
          )}
          {violation.snapshotUrl && (
            <>
              <Divider />
              <img
                src={violation.snapshotUrl}
                alt="snapshot"
                style={{ maxWidth: '100%', borderRadius: 8 }}
              />
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        {violation.status === 'open' && (
          <Button onClick={() => onResolve?.(violation.id)} variant="contained" color="error">
            Resolve
          </Button>
        )}
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
