import {
  Card,
  CardContent,
  CardHeader,
  Container,
  Divider,
  Grid,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Typography,
  List,
  ListItem,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState } from 'react';
import api from '../../../api/client';

type Contact = {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
};

export default function Contacts(): React.ReactElement {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [creating, setCreating] = useState<Contact | null>(null);

  // Load contacts
  async function fetchContacts() {
    const res = await api.get<Contact[]>('/contacts');
    setContacts(res);
  }
  useEffect(() => {
    fetchContacts();
  }, []);

  // Delete
  async function handleDelete(id: string) {
    await api.del(`/contacts/${id}`);
    fetchContacts();
  }

  // Save update
  async function handleSave() {
    if (!editing) return;
    await api.patch(`/contacts/${editing.id}`, {
      name: editing.name,
      email: editing.email,
      phone: editing.phone,
    });
    setEditing(null);
    fetchContacts();
  }

  // Save new contact
  async function handleCreate() {
    if (!creating) return;
    await api.post(`/contacts`, {
      id: creating.id,
      name: creating.name,
      email: creating.email,
      phone: creating.phone,
    });
    setCreating(null);
    fetchContacts();
  }

  return (
    <Container maxWidth={'md'} sx={{ flex: 1, display: 'flex' }}>
      <Card sx={{ flex: 1 }}>
        <CardHeader title={'Contacts Settings'} />
        <Divider />
        <CardContent>
          <Grid container sx={{ flex: 1 }} direction="column">
            <Grid size={{ xs: 12 }}>
              <TableContainer component={Paper} sx={{ height: '700px' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>id</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {contacts.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>{c.id}</TableCell>
                        <TableCell>{c.name}</TableCell>
                        <TableCell>{c.email}</TableCell>
                        <TableCell>{c.phone}</TableCell>
                        <TableCell>
                          <IconButton onClick={() => setEditing(c)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton onClick={() => handleDelete(c.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            {/* Add button */}
            <Grid size={{ xs: 12 }}>
              <Stack direction={'column'} justifyContent={'center'}>
                <Stack sx={{ my: 4, alignItems: 'center' }}>
                  <Button
                    variant={'contained'}
                    startIcon={<AddIcon />}
                    onClick={() =>
                      setCreating({
                        id: '',
                        name: '',
                        email: '',
                        phone: '',
                        createdAt: '',
                        updatedAt: '',
                      })
                    }
                  >
                    ADD
                  </Button>
                </Stack>
                <Stack sx={{ my: 4 }}>
                  <Typography variant={'body1'} sx={{ width: '100%' }}>
                    NOTE:
                  </Typography>
                  <List dense>
                    <ListItem>
                      1. Each contact must include a valid email and/or phone number.
                    </ListItem>
                    <ListItem>
                      2. You can delete a contact using the trash icon in the table.
                    </ListItem>
                    <ListItem>
                      3. Click the <strong>ADD</strong> button to register a new contact.
                    </ListItem>
                    <ListItem>
                      4. Notifications will only be sent to active contacts listed here.
                    </ListItem>
                  </List>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Edit dialog */}
      <Dialog open={!!editing} onClose={() => setEditing(null)}>
        <DialogTitle>Edit Contact</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Name"
            fullWidth
            value={editing?.name ?? ''}
            onChange={(e) => setEditing({ ...editing!, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Email"
            fullWidth
            value={editing?.email ?? ''}
            onChange={(e) => setEditing({ ...editing!, email: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Phone"
            fullWidth
            value={editing?.phone ?? ''}
            onChange={(e) => setEditing({ ...editing!, phone: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditing(null)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create dialog */}
      <Dialog open={!!creating} onClose={() => setCreating(null)}>
        <DialogTitle>Create Contact</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="ID"
            fullWidth
            value={creating?.id ?? ''}
            onChange={(e) => setCreating({ ...creating!, id: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Name"
            fullWidth
            value={creating?.name ?? ''}
            onChange={(e) => setCreating({ ...creating!, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Email"
            fullWidth
            value={creating?.email ?? ''}
            onChange={(e) => setCreating({ ...creating!, email: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Phone"
            fullWidth
            value={creating?.phone ?? ''}
            onChange={(e) => setCreating({ ...creating!, phone: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreating(null)}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
