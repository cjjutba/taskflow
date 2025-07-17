import { useCallback } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { createNotificationFromTemplate } from '../utils/notificationTemplates';
import { NotificationType } from '../types/notification.types';

export const useNotificationHelpers = () => {
  const { addNotification } = useNotification();



  // Helper to add a specific notification type
  const addNotificationByType = useCallback((type: NotificationType, variables: Record<string, any> = {}) => {
    try {
      const notification = createNotificationFromTemplate(type, variables);
      addNotification(notification);
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  }, [addNotification]);

  return {
    addNotificationByType,
  };
};
