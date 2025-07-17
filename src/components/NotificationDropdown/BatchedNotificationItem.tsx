import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Info, 
  Trophy, 
  Folder, 
  X,
  Eye,
  Users
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import { Notification } from '../../types/notification.types';
import { useNotification } from '../../contexts/NotificationContext';
import { animationVariants } from '../../utils/animations';

interface BatchedNotification extends Notification {
  batchId?: string;
  batchCount?: number;
  batchedItems?: string[];
  originalNotifications?: Notification[];
}

interface BatchedNotificationItemProps {
  notification: BatchedNotification;
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

// Default notification styling
const getNotificationColor = () => {
  return 'text-blue-600 bg-blue-50 border-blue-200';
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

export default function BatchedNotificationItem({ notification }: BatchedNotificationItemProps) {
  const { markAsRead, deleteNotification } = useNotification();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const Icon = getNotificationIcon(notification.type, notification.category);
  const notificationColor = getNotificationColor();
  const isBatched = Boolean(notification.batchCount && notification.batchCount > 1);
  
  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAsRead(notification.id);
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification(notification.id);
  };

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <motion.div
      whileHover="hover"
      whileTap="tap"
      variants={animationVariants.notificationItem}
      className={cn(
        "group relative p-3 rounded-lg border transition-all duration-200 hover:bg-muted/50 cursor-pointer",
        notification.isRead 
          ? "bg-background border-border opacity-75" 
          : "bg-background border-border shadow-sm"
      )}
    >
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
        {/* Icon with batch indicator */}
        <div className={cn(
          "relative flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border",
          notificationColor
        )}>
          <Icon className="w-4 h-4" />
          {isBatched && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold"
            >
              {notification.batchCount}
            </motion.div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className={cn(
                  "text-sm font-medium truncate",
                  notification.isRead ? "text-muted-foreground" : "text-foreground"
                )}>
                  {notification.title}
                </h4>
                
                {isBatched && (
                  <Badge variant="secondary" className="text-xs h-4 px-1">
                    <Users className="w-2 h-2 mr-1" />
                    {notification.batchCount}
                  </Badge>
                )}
              </div>
              
              <p className={cn(
                "text-xs mt-1 line-clamp-2",
                notification.isRead ? "text-muted-foreground/70" : "text-muted-foreground"
              )}>
                {notification.message}
              </p>
            </div>
            
            {/* Actions */}
            <motion.div
              className="flex items-center gap-1"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 0, x: 10 }}
              whileHover={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              {isBatched && (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleExpand}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                    title={isExpanded ? "Collapse" : "Expand"}
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </Button>
                </motion.div>
              )}
              
              <AnimatePresence>
                {!notification.isRead && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMarkAsRead}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                      title="Mark as read"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-red-600"
                  title="Delete notification"
                >
                  <X className="h-3 w-3" />
                </Button>
              </motion.div>
            </motion.div>
          </div>
          
          {/* Metadata */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(new Date(notification.createdAt))}
              </span>
              

              
              <Badge variant="secondary" className="text-xs h-4 px-1 capitalize">
                {notification.category}
              </Badge>
            </div>
          </div>
          
          {/* Expanded batch items */}
          <AnimatePresence>
            {isExpanded && isBatched && notification.batchedItems && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="mt-3 pt-3 border-t border-border"
              >
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Individual items:
                  </p>
                  {notification.batchedItems.slice(0, 10).map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="flex items-center gap-2 text-xs text-muted-foreground"
                    >
                      <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                      <span className="truncate">{item}</span>
                    </motion.div>
                  ))}
                  
                  {notification.batchedItems.length > 10 && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-xs text-muted-foreground italic"
                    >
                      ... and {notification.batchedItems.length - 10} more
                    </motion.p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
