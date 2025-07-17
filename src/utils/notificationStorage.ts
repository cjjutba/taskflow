import { Notification, NotificationSettings, NotificationStorage } from '../types/notification.types';

const STORAGE_KEY = 'taskflow_notifications';

// Default notification settings
export const defaultNotificationSettings: NotificationSettings = {
  // Task notifications
  taskCreated: true,
  taskUpdated: true,
  taskCompleted: true,
  taskDeleted: true,

  // Section notifications
  sectionCreated: true,
  sectionUpdated: true,
  sectionDeleted: true,

  // Project notifications
  projectCreated: true,
  projectUpdated: true,
  projectDeleted: true,

  // Display settings
  showBadgeCount: true,
  maxNotifications: 50,
};

class NotificationStorageService {
  private getStorageData(): NotificationStorage {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return this.createDefaultStorage();
      }

      const parsed = JSON.parse(data);

      // Parse dates
      parsed.notifications = parsed.notifications.map((notification: any) => ({
        ...notification,
        createdAt: new Date(notification.createdAt),
      }));

      return parsed;
    } catch (error) {
      console.error('Error loading notifications from storage:', error);
      return this.createDefaultStorage();
    }
  }

  private createDefaultStorage(): NotificationStorage {
    // Clear any existing notifications to start fresh
    localStorage.removeItem(STORAGE_KEY);
    return {
      notifications: [],
      settings: defaultNotificationSettings,
    };
  }

  private saveStorageData(data: NotificationStorage): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving notifications to storage:', error);
    }
  }

  // Notification CRUD operations
  getNotifications(): Notification[] {
    const data = this.getStorageData();
    return data.notifications;
  }

  addNotification(notification: Notification): void {
    const data = this.getStorageData();
    
    // Check if we're at max notifications limit
    if (data.notifications.length >= data.settings.maxNotifications) {
      // Remove oldest read notifications first
      data.notifications = data.notifications
        .sort((a, b) => {
          if (a.isRead !== b.isRead) return a.isRead ? -1 : 1;
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        })
        .slice(1);
    }

    data.notifications.push(notification);
    this.saveStorageData(data);
  }

  updateNotification(id: string, updates: Partial<Notification>): void {
    const data = this.getStorageData();
    const index = data.notifications.findIndex(n => n.id === id);
    
    if (index !== -1) {
      data.notifications[index] = { ...data.notifications[index], ...updates };
      this.saveStorageData(data);
    }
  }

  deleteNotification(id: string): void {
    const data = this.getStorageData();
    data.notifications = data.notifications.filter(n => n.id !== id);
    this.saveStorageData(data);
  }

  clearAllNotifications(): void {
    const data = this.getStorageData();
    data.notifications = [];
    this.saveStorageData(data);
  }

  markAsRead(id: string): void {
    this.updateNotification(id, { isRead: true });
  }

  markAllAsRead(): void {
    const data = this.getStorageData();
    data.notifications = data.notifications.map(n => ({ ...n, isRead: true }));
    this.saveStorageData(data);
  }

  // Settings management
  getSettings(): NotificationSettings {
    const data = this.getStorageData();
    return data.settings;
  }

  updateSettings(settings: Partial<NotificationSettings>): void {
    const data = this.getStorageData();
    data.settings = { ...data.settings, ...settings };
    this.saveStorageData(data);
  }

  // Utility methods
  getUnreadCount(): number {
    const notifications = this.getNotifications();
    return notifications.filter(n => !n.isRead).length;
  }
}

export const notificationStorage = new NotificationStorageService();
