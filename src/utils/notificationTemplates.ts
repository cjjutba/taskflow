import { NotificationType, NotificationCategory } from '../types/notification.types';

// Simple notification templates
export const notificationTemplates: Record<NotificationType, { category: NotificationCategory; title: string; message: string }> = {
  // Task notifications
  TASK_CREATED: {
    category: 'task',
    title: 'Task Created',
    message: 'Task "{taskTitle}" has been created',
  },
  TASK_UPDATED: {
    category: 'task',
    title: 'Task Updated',
    message: 'Task "{taskTitle}" has been updated',
  },
  TASK_COMPLETED: {
    category: 'task',
    title: 'Task Completed',
    message: 'Task "{taskTitle}" has been completed',
  },
  TASK_DELETED: {
    category: 'task',
    title: 'Task Deleted',
    message: 'Task "{taskTitle}" has been deleted',
  },

  // Section notifications
  SECTION_CREATED: {
    category: 'section',
    title: 'Section Created',
    message: 'Section "{sectionName}" has been created',
  },
  SECTION_UPDATED: {
    category: 'section',
    title: 'Section Updated',
    message: 'Section "{sectionName}" has been updated',
  },
  SECTION_DELETED: {
    category: 'section',
    title: 'Section Deleted',
    message: 'Section "{sectionName}" has been deleted',
  },

  // Project notifications
  PROJECT_CREATED: {
    category: 'project',
    title: 'Project Created',
    message: 'Project "{projectName}" has been created',
  },
  PROJECT_UPDATED: {
    category: 'project',
    title: 'Project Updated',
    message: 'Project "{projectName}" has been updated',
  },
  PROJECT_DELETED: {
    category: 'project',
    title: 'Project Deleted',
    message: 'Project "{projectName}" has been deleted',
  },
};

// Helper function to create notification from template
export function createNotificationFromTemplate(
  type: NotificationType,
  variables: Record<string, any> = {}
): Omit<import('../types/notification.types').Notification, 'id' | 'createdAt'> {
  const template = notificationTemplates[type];

  if (!template) {
    throw new Error(`No template found for notification type: ${type}`);
  }

  // Replace variables in title and message
  const title = replaceVariables(template.title, variables);
  const message = replaceVariables(template.message, variables);

  return {
    type,
    title,
    message,
    category: template.category,
    isRead: false,
    relatedEntityId: variables.relatedEntityId,
    relatedEntityType: variables.relatedEntityType,
  };
}

// Helper function to replace variables in templates
function replaceVariables(template: string, variables: Record<string, any>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return variables[key] !== undefined ? String(variables[key]) : match;
  });
}


