// src/api/contacts.ts
import api from './client';

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  createdAt: string;
}

// Fetch all contacts
export async function getMyContacts(): Promise<Contact[]> {
  return api.get('/me/contacts');
}

// Add a new contact
export async function addContact(data: {
  name: string;
  email?: string;
  phone?: string;
}): Promise<Contact> {
  return api.post('/me/contacts', data);
}

// Delete a contact
export async function deleteContact(id: string): Promise<void> {
  return api.del(`/me/contacts/${id}`);
}
