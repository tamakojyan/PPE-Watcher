// src/components/ViolationDetailDialog.tsx
import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Typography,
} from '@mui/material';
import { Violation } from '@/type';
import ResolveButton from './ResolveButton';
import BookmarkButton from './BookmarkButton';
import api from '../api/client';
type Props = {
  open: boolean;
  violation: Violation | null;
  onClose: () => void;
  onResolve?: (id: string) => void | Promise<void>;
  onUnbookmark?: (id: string) => void; //
};

export default function ViolationDetailDialog({
  open,
  violation,
  onClose,
  onResolve,
  onUnbookmark,
}: Props): React.ReactElement {
  if (!violation) return <></>;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Violation Detail</DialogTitle>
      <DialogContent>
        {/* Image preview */}
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          {violation.snapshotUrl ? (
            <img
              src={
                violation.snapshotUrl.startsWith('http')
                  ? violation.snapshotUrl
                  : `${api.baseURL}/uploads/${violation.snapshotUrl.split('/').pop()}`
              }
              alt="Violation snapshot"
              style={{
                maxWidth: '100%',
                maxHeight: '400px',
                objectFit: 'contain',
              }}
            />
          ) : (
            <Typography>No snapshot available</Typography>
          )}
        </div>

        {/* Details table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Handler</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Bookmark</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>{violation.id}</TableCell>
                <TableCell>{(violation.kinds ?? []).map((k) => k.type).join(', ')}</TableCell>
                <TableCell>{violation.ts}</TableCell>
                <TableCell>{violation.status}</TableCell>
                <TableCell>{violation.handler ?? '-'}</TableCell>

                {/* Reusable ResolveButton */}
                <TableCell>
                  <ResolveButton
                    violationId={violation.id}
                    status={violation.status}
                    onResolved={onResolve}
                  />
                </TableCell>

                {/* Bookmark button, trigger onUnbookmark when unbookmarked */}
                <TableCell>
                  <BookmarkButton
                    violationId={violation.id}
                    onChange={() => {
                      if (onUnbookmark) {
                        onUnbookmark(violation.id);
                        onClose();
                      }
                    }}
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
