export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  isArchived: boolean;
  createdAt: Date;
  taskId?: string; // Optional reference to a task
  actionUrl?: string; // Optional URL for action
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}

export type NotificationAction =
  | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id' | 'createdAt'> }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'DELETE_NOTIFICATION'; payload: string }
  | { type: 'ARCHIVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_ARCHIVED' };
