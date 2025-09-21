// src/components/HandleNoteAction.tsx
import * as React from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { updateNotificationStatus } from '../api/notification';

type Props = {
  id: string; // notification id
  disabled?: boolean; // e.g. already handled
  currentNote?: string; // optional: show existing note
  onUpdated?: (note: string) => void; // callback after success (e.g. refetch or update row)
  setRefreshTick: React.Dispatch<React.SetStateAction<number>>;
};

export default function HandleNoteAction({
  id,
  disabled,
  currentNote,
  onUpdated,
  setRefreshTick,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [note, setNote] = React.useState(currentNote ?? '');
  const [submitting, setSubmitting] = React.useState(false);

  // Open dialog
  const handleOpen = () => {
    setNote(currentNote ?? '');
    setOpen(true);
  };

  // Confirm -> call API
  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await updateNotificationStatus(id, 'handled', note.trim());
      onUpdated?.(note.trim());
      setOpen(false);
      setRefreshTick((t) => t + 1);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Trigger button */}
      <Button variant="contained" color="primary" onClick={handleOpen} disabled={disabled}>
        Handle
      </Button>

      {/* Note dialog */}
      <Dialog open={open} onClose={() => !submitting && setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add a note before handling</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Note"
            fullWidth
            multiline
            minRows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Write a short note..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} variant="contained" disabled={submitting}>
            {submitting ? 'Saving…' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
