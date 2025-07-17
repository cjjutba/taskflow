import React, { useEffect, useRef } from 'react';
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
  Volume2,
  VolumeX
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { cn } from '../../lib/utils';
import { Notification, NotificationPriority } from '../../types/notification.types';
import { useNotification } from '../../contexts/NotificationContext';
import { animationVariants } from '../../utils/animations';
import { RichNotificationData } from '../../utils/advancedNotificationTemplates';

interface RichNotificationItemProps {
  notification: Notification & Partial<RichNotificationData>;
}

// Animation variants for rich notifications
const richAnimationVariants = {
  bounce: {
    scale: [1, 1.05, 0.95, 1.02, 1],
    transition: { duration: 0.6, ease: "easeInOut" }
  },
  pulse: {
    scale: [1, 1.02, 1],
    opacity: [1, 0.8, 1],
    transition: { duration: 1, repeat: 2, ease: "easeInOut" }
  },
  shake: {
    x: [0, -5, 5, -5, 5, 0],
    transition: { duration: 0.5, ease: "easeInOut" }
  },
  glow: {
    boxShadow: [
      "0 0 0 0 rgba(59, 130, 246, 0)",
      "0 0 0 4px rgba(59, 130, 246, 0.1)",
      "0 0 0 0 rgba(59, 130, 246, 0)"
    ],
    transition: { duration: 2, repeat: 1, ease: "easeInOut" }
  },
  slide: {
    x: [-20, 0],
    opacity: [0, 1],
    transition: { duration: 0.3, ease: "easeOut" }
  }
};

// Sound effects (placeholder - would integrate with actual sound system)
const playNotificationSound = (soundType?: string) => {
  if (!soundType || soundType === 'none') return;
  
  // In a real implementation, you would play actual sound files
  console.log(`Playing sound: ${soundType}`);
  
  // For demo purposes, we could use the Web Audio API or HTML5 audio
  // This is just a placeholder
};

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

// Parse rich text (simple HTML-like formatting)
const parseRichText = (text: string): React.ReactNode => {
  if (!text) return null;
  
  // Simple parser for basic HTML tags
  const parts = text.split(/(<[^>]+>)/);
  
  return parts.map((part, index) => {
    if (part.startsWith('<strong')) {
      const content = part.replace(/<strong[^>]*>|<\/strong>/g, '');
      const styleMatch = part.match(/style="([^"]+)"/);
      const style = styleMatch ? parseInlineStyle(styleMatch[1]) : {};
      return <strong key={index} style={style}>{content}</strong>;
    } else if (part.startsWith('<em')) {
      const content = part.replace(/<em[^>]*>|<\/em>/g, '');
      return <em key={index}>{content}</em>;
    } else if (part === '<br/>' || part === '<br>') {
      return <br key={index} />;
    } else if (!part.startsWith('<')) {
      return part;
    }
    return null;
  });
};

// Parse inline CSS styles
const parseInlineStyle = (styleString: string): React.CSSProperties => {
  const styles: React.CSSProperties = {};
  const declarations = styleString.split(';');
  
  declarations.forEach(declaration => {
    const [property, value] = declaration.split(':').map(s => s.trim());
    if (property && value) {
      // Convert kebab-case to camelCase
      const camelProperty = property.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      (styles as any)[camelProperty] = value;
    }
  });
  
  return styles;
};

export default function RichNotificationItem({ notification }: RichNotificationItemProps) {
  const { markAsRead, deleteNotification, handleAction } = useNotification();
  const hasPlayedSound = useRef(false);
  
  const Icon = getNotificationIcon(notification.type, notification.category);
  const layout = notification.layout || 'compact';
  const isExpanded = layout === 'expanded';
  
  // Play sound effect on mount (only once)
  useEffect(() => {
    if (!hasPlayedSound.current && notification.sound) {
      playNotificationSound(notification.sound);
      hasPlayedSound.current = true;
    }
  }, [notification.sound]);
  
  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAsRead(notification.id);
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification(notification.id);
  };

  const handleActionClick = (actionId: string) => {
    handleAction(notification.id, actionId);
  };

  // Apply custom styles
  const customStyles = notification.customStyles ? {
    backgroundColor: notification.customStyles.backgroundColor,
    borderColor: notification.customStyles.borderColor,
    color: notification.customStyles.textColor,
  } : {};

  // Get animation variant
  const animationVariant = notification.animation && notification.animation !== 'none' 
    ? richAnimationVariants[notification.animation as keyof typeof richAnimationVariants]
    : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, ...animationVariant }}
      exit={{ opacity: 0, y: -20 }}
      whileHover="hover"
      variants={animationVariants.notificationItem}
      className={cn(
        "group relative rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer",
        isExpanded ? "p-4" : "p-3",
        notification.isRead 
          ? "opacity-75" 
          : "shadow-sm"
      )}
      style={customStyles}
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
        {/* Icon */}
        <div className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border",
          notification.customStyles?.iconColor 
            ? `text-[${notification.customStyles.iconColor}] border-[${notification.customStyles.iconColor}]`
            : "text-blue-600 border-blue-200 bg-blue-50"
        )}>
          <Icon className="w-4 h-4" />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              {/* Title */}
              <h4 className={cn(
                "font-medium",
                isExpanded ? "text-base" : "text-sm",
                notification.isRead ? "text-muted-foreground" : "text-foreground"
              )}>
                {notification.richTitle ? parseRichText(notification.richTitle) : notification.title}
              </h4>
              
              {/* Message */}
              <div className={cn(
                "mt-1",
                isExpanded ? "text-sm" : "text-xs",
                notification.isRead ? "text-muted-foreground/70" : "text-muted-foreground",
                isExpanded ? "line-clamp-3" : "line-clamp-2"
              )}>
                {notification.richMessage ? parseRichText(notification.richMessage) : notification.message}
              </div>
              
              {/* Progress bar */}
              {notification.showProgress && notification.progressValue !== undefined && (
                <motion.div
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="mt-3"
                >
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Progress</span>
                    <span>{notification.progressValue}%</span>
                  </div>
                  <Progress value={notification.progressValue} className="h-1" />
                </motion.div>
              )}
            </div>
            
            {/* Actions */}
            <motion.div
              className="flex items-center gap-1"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 0, x: 10 }}
              whileHover={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              {notification.sound && notification.sound !== 'none' && (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                    title="Sound enabled"
                  >
                    <Volume2 className="h-3 w-3" />
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
              
              {notification.priority !== 'low' && (
                <Badge variant="outline" className="text-xs h-4 px-1">
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
                {notification.actions.slice(0, 2).map((action, index) => (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant={action.type === 'primary' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleActionClick(action.id)}
                      className={cn(
                        "h-7 px-3 text-xs",
                        action.type === 'destructive' && "border-red-200 text-red-600 hover:bg-red-50"
                      )}
                    >
                      {action.label}
                    </Button>
                  </motion.div>
                ))}
                
                {notification.actions.length > 2 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-muted-foreground"
                    >
                      +{notification.actions.length - 2} more
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
