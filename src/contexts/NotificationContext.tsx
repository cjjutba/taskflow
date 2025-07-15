import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Notification, NotificationState, NotificationAction } from '../types/notification';
import { useTask } from './TaskContext';

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
};

function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      const newNotification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: new Date(),
        isRead: false,
        isArchived: false,
      };
      return {
        ...state,
        notifications: [newNotification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      };

    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? { ...notification, isRead: true }
            : notification
        ),
        unreadCount: state.unreadCount - (
          state.notifications.find(n => n.id === action.payload && !n.isRead) ? 1 : 0
        ),
      };

    case 'MARK_ALL_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification => ({
          ...notification,
          isRead: true,
        })),
        unreadCount: 0,
      };

    case 'DELETE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(notification => notification.id !== action.payload),
        unreadCount: state.unreadCount - (
          state.notifications.find(n => n.id === action.payload && !n.isRead) ? 1 : 0
        ),
      };

    case 'ARCHIVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? { ...notification, isArchived: true, isRead: true }
            : notification
        ),
        unreadCount: state.unreadCount - (
          state.notifications.find(n => n.id === action.payload && !n.isRead) ? 1 : 0
        ),
      };

    case 'CLEAR_ARCHIVED':
      return {
        ...state,
        notifications: state.notifications.filter(notification => !notification.isArchived),
      };

    default:
      return state;
  }
}

const NotificationContext = createContext<{
  state: NotificationState;
  dispatch: React.Dispatch<NotificationAction>;
}>({
  state: initialState,
  dispatch: () => null,
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const { state: taskState } = useTask();

  // Check for overdue tasks and create notifications
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    taskState.tasks.forEach(task => {
      if (
        !task.completed &&
        task.dueDate &&
        task.dueDate < today &&
        !state.notifications.some(
          n => n.taskId === task.id && n.type === 'warning' && n.title.includes('overdue')
        )
      ) {
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            title: 'Task Overdue',
            message: `"${task.title}" is overdue`,
            type: 'warning',
            taskId: task.id,
          },
        });
      }
    });
  }, [taskState.tasks, state.notifications]);

  return (
    <NotificationContext.Provider value={{ state, dispatch }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
