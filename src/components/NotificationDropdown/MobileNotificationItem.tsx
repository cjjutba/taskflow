import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Info, 
  Trophy, 
  Folder, 
  X,
  Eye,
  Check,
  Archive
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import { Notification, NotificationPriority } from '../../types/notification.types';
import { useNotification } from '../../contexts/NotificationContext';
import { useMobileOptimization } from '../../hooks/useMobileOptimization';
import { animationVariants } from '../../utils/animations';

interface MobileNotificationItemProps {
  notification: Notification;
  index: number;
}

// Icon mapping for notification types
const getNotificationIcon = (type: string, category: string) => {
  switch (category) {
    case 'task':
      if (type.includes('COMPLETED')) return CheckCircle;
      if (type.includes('OVERDUE')) return AlertTriangle;
      if (type.includes('DUE_SOON')) return Clock;
      return CheckCircle;
    case 'project':
      if (type.includes('MILESTONE')) return Trophy;
      return Folder;
    case 'productivity':
      if (type.includes('ACHIEVEMENT')) return Trophy;
      return Info;
    case 'system':
      return Info;
    default:
      return Info;
  }
};

// Priority color mapping
const getPriorityColor = (priority: NotificationPriority) => {
  switch (priority) {
    case 'urgent':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'high':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'medium':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'low':
      return 'text-gray-600 bg-gray-50 border-gray-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

// Format relative time
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return date.toLocaleDateString();
};

export default function MobileNotificationItem({ notification, index }: MobileNotificationItemProps) {
  const { markAsRead, deleteNotification } = useNotification();
  const { 
    isMobile, 
    triggerHapticFeedback, 
    useSwipeGesture, 
    getNotificationItemStyles 
  } = useMobileOptimization();
  
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  
  const Icon = getNotificationIcon(notification.type, notification.category);
  const priorityColor = getPriorityColor(notification.priority);
  
  const handleMarkAsRead = () => {
    triggerHapticFeedback('light');
    markAsRead(notification.id);
  };
  
  const handleDelete = () => {
    triggerHapticFeedback('medium');
    deleteNotification(notification.id);
  };

  const handleActionClick = (actionId: string) => {
    triggerHapticFeedback('light');
    handleAction(notification.id, actionId);
  };

  // Swipe gesture handlers
  const swipeGestureProps = useSwipeGesture(
    // onSwipeLeft - Delete
    () => {
      triggerHapticFeedback('heavy');
      handleDelete();
    },
    // onSwipeRight - Mark as read
    () => {
      if (!notification.isRead) {
        triggerHapticFeedback('medium');
        handleMarkAsRead();
      }
    }
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, x: swipeOffset }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group relative rounded-lg border transition-all duration-200 cursor-pointer",
        "notification-item",
        notification.isRead 
          ? "bg-background border-border opacity-75" 
          : "bg-background border-border shadow-sm",
        isSwipeActive && "swiping"
      )}
      style={{
        ...getNotificationItemStyles(),
        transform: `translateX(${swipeOffset}px)`,
      }}
      {...(isMobile ? swipeGestureProps : {})}
      onTouchStart={(e) => {
        if (isMobile) {
          setIsSwipeActive(true);
          swipeGestureProps.onTouchStart?.(e.nativeEvent);
        }
      }}
      onTouchMove={(e) => {
        if (isMobile) {
          swipeGestureProps.onTouchMove?.(e.nativeEvent);
          // Update swipe offset for visual feedback
          const touch = e.touches[0];
          const startX = (e.target as any)._startX || touch.clientX;
          const deltaX = touch.clientX - startX;
          setSwipeOffset(Math.max(-100, Math.min(100, deltaX * 0.5)));
        }
      }}
      onTouchEnd={(e) => {
        if (isMobile) {
          setIsSwipeActive(false);
          setSwipeOffset(0);
          swipeGestureProps.onTouchEnd?.(e.nativeEvent);
        }
      }}
    >
      {/* Swipe indicators */}
      {isMobile && (
        <>
          <div className="swipe-indicator left">
            <Check className="h-4 w-4 text-green-600" />
          </div>
          <div className="swipe-indicator right">
            <X className="h-4 w-4 text-red-600" />
          </div>
        </>
      )}

      {/* Unread indicator */}
      <AnimatePresence>
        {!notification.isRead && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "backOut" }}
            className="absolute left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full"
          />
        )}
      </AnimatePresence>
      
      {/* Main content */}
      <div className="flex items-start gap-3 ml-2">
        {/* Icon */}
        <div className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border",
          priorityColor
        )}>
          <Icon className="w-4 h-4" />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              {/* Title */}
              <h4 className={cn(
                "text-sm font-medium truncate",
                notification.isRead ? "text-muted-foreground" : "text-foreground"
              )}>
                {notification.title}
              </h4>
              
              {/* Message */}
              <p className={cn(
                "text-xs mt-1 line-clamp-2",
                notification.isRead ? "text-muted-foreground/70" : "text-muted-foreground"
              )}>
                {notification.message}
              </p>
            </div>
            
            {/* Mobile actions - only show if not swiping */}
            {!isMobile && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!notification.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAsRead}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                    title="Mark as read"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-red-600"
                  title="Delete notification"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
          
          {/* Metadata */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(new Date(notification.createdAt))}
              </span>
              
              {notification.priority !== 'low' && (
                <Badge 
                  variant="outline" 
                  className={cn("text-xs h-4 px-1", priorityColor)}
                >
                  {notification.priority}
                </Badge>
              )}
              
              <Badge variant="secondary" className="text-xs h-4 px-1 capitalize">
                {notification.category}
              </Badge>
            </div>
          </div>
          
          {/* Action buttons */}
          <AnimatePresence>
            {notification.isActionable && notification.actions && notification.actions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                className="flex items-center gap-2 mt-3"
              >
                {notification.actions.slice(0, isMobile ? 1 : 2).map((action, actionIndex) => (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: actionIndex * 0.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant={action.type === 'primary' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleActionClick(action.id)}
                      className={cn(
                        "h-8 px-3 text-xs",
                        action.type === 'destructive' && "border-red-200 text-red-600 hover:bg-red-50",
                        isMobile && "min-h-[44px] px-4 text-sm" // Touch-friendly sizing
                      )}
                    >
                      {action.label}
                    </Button>
                  </motion.div>
                ))}
                
                {notification.actions.length > (isMobile ? 1 : 2) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-8 px-2 text-xs text-muted-foreground",
                        isMobile && "min-h-[44px] px-3 text-sm"
                      )}
                    >
                      +{notification.actions.length - (isMobile ? 1 : 2)} more
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
