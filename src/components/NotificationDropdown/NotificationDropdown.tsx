import { useState } from 'react';
import { Bell, ExternalLink, Trash2, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { cn } from '../../lib/utils';
import { useNotification } from '../../contexts/NotificationContext';
import NotificationEmptyState from './NotificationEmptyState';
import NotificationModal from './NotificationModal';

interface NotificationDropdownProps {
  className?: string;
}

export default function NotificationDropdown({ className }: NotificationDropdownProps) {
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    clearAll,
    markAsRead,
    deleteNotification,
  } = useNotification();

  const [isOpen, setIsOpen] = useState(false);
  const [showAllModal, setShowAllModal] = useState(false);

  // Get recent notifications (limit to 6 for dropdown preview)
  const recentNotifications = notifications
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  return (
    <>
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "relative h-9 w-9 rounded-lg transition-all duration-200",
            "hover:bg-muted hover:text-foreground",
            "border border-transparent hover:border-border",
            unreadCount > 0 && "text-blue-600",
            className
          )}
          aria-label={`Notifications (${unreadCount} unread)`}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="p-0 bg-background border-border shadow-lg w-80 max-h-[32rem]"
        sideOffset={8}
      >
        <div className="w-full flex flex-col max-h-[32rem]"
          role="menu"
          aria-label="Notifications menu"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium text-foreground">Notifications</h3>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs h-5 px-1.5">
                  {unreadCount}
                </Badge>
              )}
            </div>

            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                Mark all read
              </Button>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {recentNotifications.length === 0 ? (
              <div className="p-6 text-center">
                <NotificationEmptyState category="all" />
              </div>
            ) : (
              <ScrollArea className="h-full max-h-80">
                <div className="py-1">
                  {recentNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "group flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-b-0",
                        !notification.isRead && "bg-blue-50/50"
                      )}
                    >
                      {/* Notification Icon */}
                      <div className={cn(
                        "flex-shrink-0 w-2 h-2 rounded-full mt-2",
                        !notification.isRead ? "bg-blue-500" : "bg-muted-foreground/30"
                      )} />

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-medium text-foreground truncate">
                            {notification.title}
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-muted-foreground hover:text-destructive transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {notification.createdAt.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>

                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className="text-xs h-4 px-1">
                              {notification.category}
                            </Badge>

                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="h-4 px-1 text-xs text-blue-600 hover:text-blue-700"
                              >
                                Mark read
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-2 border-t border-border bg-muted/20 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllModal(true)}
              className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View All
            </Button>

            <div className="flex items-center gap-1">
              {notifications.length > 5 && (
                <span className="text-xs text-muted-foreground">
                  +{notifications.length - 6} more
                </span>
              )}

              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>

    {/* Full Notifications Modal */}
    <NotificationModal
      isOpen={showAllModal}
      onClose={() => setShowAllModal(false)}
      initialTab="all"
    />
  </>
  );
}
