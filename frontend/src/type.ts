// ---------------- Enums ----------------
export enum NotificationStatus {
  read = 'read',
  unread = 'unread',
}

export enum NotificationType {
  violation = 'violation',
  resolved = 'resolved',
}

export enum ViolationType {
  no_helmet = 'no_helmet',
  no_mask = 'no_mask',
  no_vest = 'no_vest',
  no_gloves = 'no_gloves',
}

export enum ViolationStatus {
  open = 'open',
  resolved = 'resolved',
}
// ---------------- Models ----------------

// User
export interface User {
  id: string; // e.g. "USR001"
  email: string;
  password: string;
  createdAt: string; // ISO date
  violationBookmarks?: UserViolationBookmark[];
  notices?: Notification[];
}

// Contact
export interface Contact {
  id: string; // e.g. "CON001"
  name: string;
  email?: string;
  phone?: string;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}

// Violation
export interface Violation {
  id: string; // e.g. "VIO001"
  kinds?: ViolationKind[];
  confidence?: number;
  ts: string; // ISO date
  snapshotUrl?: string;
  status: ViolationStatus;
  handler: string;
  notices?: Notification[];
  bookmarkedBy?: UserViolationBookmark[];
}

// ViolationKind (junction table)
export interface ViolationKind {
  violationId: string;
  type: ViolationType;
  violation?: Violation;
}

// Notification
export interface Notification {
  id: string; // e.g. "NTF001"
  type: NotificationType;
  kind: ViolationType;
  status: NotificationStatus;
  createdAt: string; // ISO date
  readAt?: string; // ISO date
  violationId?: string;
  violation?: Violation;
  userId?: string;
  user?: User;
  message?: string;
  note?: string;
}

// UserViolationBookmark (junction table)
export interface UserViolationBookmark {
  userId: string;
  violationId: string;
  createdAt: string; // ISO date
  user?: User;
  violation?: Violation;
}
