export type NotificationType =
  // Task CRUD operations
  | 'TASK_CREATED'
  | 'TASK_UPDATED'
  | 'TASK_COMPLETED'
  | 'TASK_DELETED'
  // Section CRUD operations
  | 'SECTION_CREATED'
  | 'SECTION_UPDATED'
  | 'SECTION_DELETED'
  // Project CRUD operations
  | 'PROJECT_CREATED'
  | 'PROJECT_UPDATED'
  | 'PROJECT_DELETED';

export type NotificationCategory = 'task' | 'section' | 'project';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  category: NotificationCategory;
  isRead: boolean;
  createdAt: Date;
  relatedEntityId?: string;
  relatedEntityType?: 'task' | 'project' | 'section';
}

export interface NotificationSettings {
  // Task notifications
  taskCreated: boolean;
  taskUpdated: boolean;
  taskCompleted: boolean;
  taskDeleted: boolean;

  // Section notifications
  sectionCreated: boolean;
  sectionUpdated: boolean;
  sectionDeleted: boolean;

  // Project notifications
  projectCreated: boolean;
  projectUpdated: boolean;
  projectDeleted: boolean;

  // Display settings
  showBadgeCount: boolean;
  maxNotifications: number;
}

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  settings: NotificationSettings;

  // Basic notification management
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;

  // Settings
  updateSettings: (settings: Partial<NotificationSettings>) => void;
}

// Simple storage type
export interface NotificationStorage {
  notifications: Notification[];
  settings: NotificationSettings;
}
