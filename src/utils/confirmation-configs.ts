import { ConfirmationOptions } from '../types/confirmation.types';

// Task-related confirmation configurations
export const taskConfirmations = {
  deleteTask: (taskTitle: string): Omit<ConfirmationOptions, 'onConfirm'> => ({
    title: 'Delete Task',
    description: `Are you sure you want to delete "${taskTitle}"?`,
    confirmText: 'Delete',
    cancelText: 'Cancel',
    variant: 'destructive' as const,
    details: ['This action cannot be undone']
  }),

  deleteMultipleTasks: (count: number): Omit<ConfirmationOptions, 'onConfirm'> => ({
    title: 'Delete Tasks',
    description: `Are you sure you want to delete ${count} task${count > 1 ? 's' : ''}?`,
    confirmText: 'Delete All',
    cancelText: 'Cancel',
    variant: 'destructive' as const,
    details: [
      'This action cannot be undone',
      'All selected tasks will be permanently removed'
    ]
  }),

  markTaskComplete: (taskTitle: string): Omit<ConfirmationOptions, 'onConfirm'> => ({
    title: 'Mark as Complete',
    description: `Mark "${taskTitle}" as completed?`,
    confirmText: 'Complete',
    cancelText: 'Cancel',
    variant: 'info' as const
  }),

  restoreTask: (taskTitle: string): Omit<ConfirmationOptions, 'onConfirm'> => ({
    title: 'Restore Task',
    description: `Restore "${taskTitle}" to active status?`,
    confirmText: 'Restore',
    cancelText: 'Cancel',
    variant: 'info' as const
  })
};

// Project-related confirmation configurations
export const projectConfirmations = {
  deleteProject: (projectName: string, taskCount: number): Omit<ConfirmationOptions, 'onConfirm'> => ({
    title: 'Delete Project',
    description: `Are you sure you want to delete "${projectName}"?`,
    confirmText: 'Delete Project',
    cancelText: 'Cancel',
    variant: 'destructive' as const,
    details: taskCount > 0 ? [
      `${taskCount} task${taskCount > 1 ? 's' : ''} will be moved to Inbox`,
      'Project settings and history will be lost',
      'This action cannot be undone'
    ] : [
      'Project settings and history will be lost',
      'This action cannot be undone'
    ]
  }),

  archiveProject: (projectName: string): Omit<ConfirmationOptions, 'onConfirm'> => ({
    title: 'Archive Project',
    description: `Archive "${projectName}" and all its tasks?`,
    confirmText: 'Archive',
    cancelText: 'Cancel',
    variant: 'warning' as const,
    details: [
      'Tasks will be hidden from active views',
      'Project can be restored later'
    ]
  })
};

// Section-related confirmation configurations
export const sectionConfirmations = {
  deleteSection: (sectionName: string, taskCount: number): Omit<ConfirmationOptions, 'onConfirm'> => ({
    title: 'Delete Section',
    description: `Delete "${sectionName}" section?`,
    confirmText: 'Delete Section',
    cancelText: 'Cancel',
    variant: 'destructive' as const,
    details: taskCount > 0 ? [
      `${taskCount} task${taskCount > 1 ? 's' : ''} will be moved to Unsorted`,
      'Section settings will be lost',
      'This action cannot be undone'
    ] : [
      'Section settings will be lost',
      'This action cannot be undone'
    ]
  }),

  clearSection: (sectionName: string, taskCount: number): Omit<ConfirmationOptions, 'onConfirm'> => ({
    title: 'Clear Section',
    description: `Remove all ${taskCount} task${taskCount > 1 ? 's' : ''} from "${sectionName}"?`,
    confirmText: 'Clear Section',
    cancelText: 'Cancel',
    variant: 'warning' as const,
    details: [
      'Tasks will be moved to Unsorted',
      'Section will remain empty'
    ]
  })
};

// Bulk operation confirmation configurations
export const bulkConfirmations = {
  bulkDelete: (count: number, context: string): Omit<ConfirmationOptions, 'onConfirm'> => ({
    title: 'Bulk Delete',
    description: `Delete ${count} selected ${context}${count > 1 ? 's' : ''}?`,
    confirmText: 'Delete All',
    cancelText: 'Cancel',
    variant: 'destructive' as const,
    details: [
      'This action cannot be undone',
      'All selected items will be permanently removed'
    ]
  }),

  bulkMove: (count: number, destination: string): Omit<ConfirmationOptions, 'onConfirm'> => ({
    title: 'Move Tasks',
    description: `Move ${count} task${count > 1 ? 's' : ''} to "${destination}"?`,
    confirmText: 'Move',
    cancelText: 'Cancel',
    variant: 'info' as const
  }),

  clearAllCompleted: (count: number): Omit<ConfirmationOptions, 'onConfirm'> => ({
    title: 'Clear Completed Tasks',
    description: `Permanently delete ${count} completed task${count > 1 ? 's' : ''}?`,
    confirmText: 'Clear All',
    cancelText: 'Cancel',
    variant: 'destructive' as const,
    details: [
      'This action cannot be undone',
      'Completed tasks will be permanently removed'
    ]
  })
};

// Data management confirmation configurations
export const dataConfirmations = {
  resetAllData: (): Omit<ConfirmationOptions, 'onConfirm'> => ({
    title: 'Reset All Data',
    description: 'This will permanently delete all tasks, projects, and settings.',
    confirmText: 'Reset Everything',
    cancelText: 'Cancel',
    variant: 'destructive' as const,
    details: [
      'All tasks will be deleted',
      'All projects will be deleted',
      'All settings will be reset',
      'This action cannot be undone'
    ]
  }),

  importOverwrite: (): Omit<ConfirmationOptions, 'onConfirm'> => ({
    title: 'Import Data',
    description: 'Importing will overwrite all existing data.',
    confirmText: 'Import',
    cancelText: 'Cancel',
    variant: 'warning' as const,
    details: [
      'Current tasks will be replaced',
      'Current projects will be replaced',
      'This action cannot be undone'
    ]
  })
};
