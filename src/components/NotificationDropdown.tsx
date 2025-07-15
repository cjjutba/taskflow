import React from 'react';
import { Bell, Check, Trash2, Archive, CheckCheck, X } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationDropdown() {
  const { state, dispatch } = useNotification();

  const activeNotifications = state.notifications.filter(n => !n.isArchived);
  const unreadNotifications = activeNotifications.filter(n => !n.isRead);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  const markAsRead = (id: string) => {
    dispatch({ type: 'MARK_AS_READ', payload: id });
  };

  const deleteNotification = (id: string) => {
    dispatch({ type: 'DELETE_NOTIFICATION', payload: id });
  };

  const archiveNotification = (id: string) => {
    dispatch({ type: 'ARCHIVE_NOTIFICATION', payload: id });
  };

  const markAllAsRead = () => {
    dispatch({ type: 'MARK_ALL_AS_READ' });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="p-2 relative">
          <Bell className="w-5 h-5" />
          {state.unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
            >
              {state.unreadCount > 99 ? '99+' : state.unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-white border border-border shadow-lg">
        <div className="p-3 border-b border-border">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Notifications</h4>
            {unreadNotifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs h-6 px-2"
              >
                <CheckCheck className="w-3 h-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
          {state.unreadCount > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {state.unreadCount} unread notification{state.unreadCount > 1 ? 's' : ''}
            </p>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {activeNotifications.length === 0 ? (
            <div className="p-4 text-center">
              <Bell className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No notifications</p>
              <p className="text-xs text-muted-foreground">You're all caught up! 🎉</p>
            </div>
          ) : (
            activeNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors ${
                  !notification.isRead ? 'bg-blue-50/50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-lg flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                        </p>
                      </div>
                      
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 mt-2">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="h-6 px-2 text-xs"
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Mark read
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => archiveNotification(notification.id)}
                        className="h-6 px-2 text-xs"
                      >
                        <Archive className="w-3 h-3 mr-1" />
                        Archive
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        className="h-6 px-2 text-xs text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {activeNotifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch({ type: 'CLEAR_ARCHIVED' })}
                className="w-full text-xs"
              >
                Clear archived notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
