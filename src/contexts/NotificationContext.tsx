import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  Notification,
  NotificationContextType,
  NotificationSettings,
  NotificationCategory,
  NotificationType
} from '../types/notification.types';
import { notificationStorage } from '../utils/notificationStorage';

// Create the context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Provider component props
interface NotificationProviderProps {
  children: ReactNode;
}

// Provider component
export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>(notificationStorage.getSettings());

  // Load notifications from storage on mount
  useEffect(() => {
    // Load existing notifications from localStorage
    const storedNotifications = notificationStorage.getNotifications();
    setNotifications(storedNotifications);

    // Initialize settings if they don't exist
    const storedSettings = notificationStorage.getSettings();
    if (Object.keys(storedSettings).length === 0) {
      // First time setup - enable all CRUD notifications
      const defaultSettings = {
        taskCreated: true,
        taskUpdated: true,
        taskCompleted: true,
        taskDeleted: true,
        sectionCreated: true,
        sectionUpdated: true,
        sectionDeleted: true,
        projectCreated: true,
        projectUpdated: true,
        projectDeleted: true,
      };
      notificationStorage.updateSettings(defaultSettings);
      setSettings(defaultSettings);
    } else {
      setSettings(storedSettings);
    }
  }, []);

  // Computed values
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const shouldShowNotification = useCallback((type: NotificationType): boolean => {
    // Check if notification type is enabled in settings
    const settingKey = type.toLowerCase().replace(/_/g, '') as keyof NotificationSettings;
    const isEnabled = settings[settingKey as keyof NotificationSettings];
    return typeof isEnabled === 'boolean' ? isEnabled : true;
  }, [settings]);

  // Notification management functions
  const addNotification = useCallback((
    notificationData: Omit<Notification, 'id' | 'createdAt'>
  ) => {
    // Check if we should show this notification
    if (!shouldShowNotification(notificationData.type)) {
      return;
    }

    const notification: Notification = {
      ...notificationData,
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };

    // Add to storage
    notificationStorage.addNotification(notification);

    // Update state
    setNotifications(prev => [...prev, notification]);
  }, [shouldShowNotification]);

  const markAsRead = useCallback((id: string) => {
    notificationStorage.markAsRead(id);
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    notificationStorage.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    notificationStorage.deleteNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    notificationStorage.clearAllNotifications();
    setNotifications([]);
  }, []);


  // Settings management
  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    notificationStorage.updateSettings(newSettings);
    setSettings(updatedSettings);
  }, [settings]);

  // Context value
  const contextValue: NotificationContextType = {
    notifications,
    unreadCount,
    settings,

    // Basic notification management
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,

    // Settings
    updateSettings,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use the notification context
export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);

  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }

  return context;
};

// Export the context for advanced use cases
export { NotificationContext };
