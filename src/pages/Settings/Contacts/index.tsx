import {
  Card,
  CardContent,
  CardHeader,
  Container,
  Divider,
  Grid,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Button,
  Stack,
  List,
  ListItem,
} from '@mui/material';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { mockContacts } from 'mock/contacts';

export default function Contacts(): React.ReactElement {
  return (
    <Container maxWidth={'md'} sx={{ flex: 1, display: 'flex' }}>
      <Card sx={{ flex: 1 }}>
        <CardHeader title={'Contacts Settings'} />
        <Divider />
        <CardContent>
          <Grid container sx={{ flex: 1 }} direction="column">
            <Grid size={{ xs: 12 }}>
              <TableContainer
                component={Paper}
                sx={{ overflow: 'auto', WebkitOverflowScrolling: 'touch', height: '700px' }}
              >
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>id</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>email</TableCell>
                      <TableCell>phone</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockContacts.map((contact) => (
                      <TableRow key={contact.email}>
                        <TableCell>{contact.id}</TableCell>
                        <TableCell>{contact.name}</TableCell>
                        <TableCell>{contact.email}</TableCell>
                        <TableCell>{contact.phone}</TableCell>
                        <TableCell>
                          <IconButton>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Stack direction={'column'} justifyContent={'center'}>
                <Stack sx={{ my: 4, alignItems: 'center' }}>
                  <Button variant={'contained'}>ADD</Button>
                </Stack>
                <Stack sx={{ my: 4 }}>
                  <Typography variant={'body1'} sx={{ width: '100%' }}>
                    NOTE:
                  </Typography>
                  <List dense>
                    <ListItem>
                      1.Each contact must include a valid email and/or phone number.
                    </ListItem>
                    <ListItem>
                      2.You can delete a contact using the trash icon in the table.
                    </ListItem>
                    <ListItem>
                      3.Click the&nbsp;<strong>ADD</strong>&nbsp;button to register a new contact.
                    </ListItem>
                    <ListItem>
                      4.Notifications will only be sent to active contacts listed here.
                    </ListItem>
                  </List>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
}
