import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, X, Trash2, Archive } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { cn } from '../../lib/utils';
import { useNotification } from '../../contexts/NotificationContext';
import { NotificationCategory } from '../../types/notification.types';
import NotificationItem from './NotificationItem';
import BatchedNotificationItem from './BatchedNotificationItem';
import RichNotificationItem from './RichNotificationItem';
import NotificationEmptyState from './NotificationEmptyState';
import { animationVariants } from '../../utils/animations';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'all' | NotificationCategory;
}

export default function NotificationModal({ 
  isOpen, 
  onClose, 
  initialTab = 'all' 
}: NotificationModalProps) {
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    clearAll,
  } = useNotification();

  const [activeTab, setActiveTab] = useState<'all' | NotificationCategory>(initialTab);

  // Get notifications based on active tab
  const getFilteredNotifications = () => {
    if (activeTab === 'all') {
      return notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return notifications.filter(n => n.category === activeTab).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const filteredNotifications = getFilteredNotifications();

  // Category counts
  const taskCount = notifications.filter(n => n.category === 'task').length;
  const projectCount = notifications.filter(n => n.category === 'project').length;
  const sectionCount = notifications.filter(n => n.category === 'section').length;

  const handleClearCategory = () => {
    // For simplified system, just clear all notifications
    clearAll();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] p-0 flex flex-col">
        <DialogHeader className="p-6 pb-4 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            All Notifications
          </DialogTitle>
          <DialogDescription>
            View and manage all your notifications in one place.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {/* Header Actions */}
          <div className="flex items-center justify-between px-6 pb-4">
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {unreadCount} unread
                </Badge>
              )}
              <span className="text-sm text-muted-foreground">
                {notifications.length} total notifications
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  className="h-8 px-3 text-xs"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Mark all read
                </Button>
              )}
              
              {notifications.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearCategory}
                  className="h-8 px-3 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear All
                </Button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as any)}
            className="w-full flex-1 flex flex-col min-h-0"
          >
            <div className="px-6 pb-4 flex-shrink-0">
              <TabsList className="grid w-full grid-cols-4 h-10">
                <TabsTrigger value="all" className="text-sm h-8 min-w-0">
                  <span className="truncate">All</span>
                  {notifications.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs flex-shrink-0">
                      {notifications.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="task" className="text-sm h-8 min-w-0">
                  <span className="truncate">Tasks</span>
                  {taskCount > 0 && (
                    <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs flex-shrink-0">
                      {taskCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="section" className="text-sm h-8 min-w-0">
                  <span className="truncate">Sections</span>
                  {sectionCount > 0 && (
                    <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs flex-shrink-0">
                      {sectionCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="project" className="text-sm h-8 min-w-0">
                  <span className="truncate">Projects</span>
                  {projectCount > 0 && (
                    <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs flex-shrink-0">
                      {projectCount}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Content */}
            <TabsContent value={activeTab} className="mt-0 px-6 flex-1 min-h-0 overflow-hidden">
              <div className="h-full flex flex-col">
                {filteredNotifications.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center min-h-[200px]">
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      variants={animationVariants.fadeIn}
                    >
                      <NotificationEmptyState category={activeTab} />
                    </motion.div>
                  </div>
                ) : (
                  <div className="flex-1 min-h-0">
                    <ScrollArea className="h-full">
                      <motion.div
                        className="space-y-2 pr-4 pb-4"
                        initial="hidden"
                        animate="visible"
                        variants={animationVariants.staggerContainer}
                      >
                      <AnimatePresence mode="popLayout">
                        {filteredNotifications.map((notification, index) => (
                          <motion.div
                            key={notification.id}
                            layout
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={animationVariants.notificationItem}
                            custom={index}
                            className="notification-item"
                          >
                            {(notification as any).batchCount ? (
                              <BatchedNotificationItem
                                notification={notification as any}
                              />
                            ) : (notification as any).richTitle || (notification as any).richMessage ? (
                              <RichNotificationItem
                                notification={notification as any}
                              />
                            ) : (
                              <NotificationItem
                                notification={notification}
                              />
                            )}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </motion.div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 pt-4 border-t border-border bg-muted/30 flex-shrink-0">
          <div className="text-sm text-muted-foreground">
            {filteredNotifications.length} {activeTab === 'all' ? '' : activeTab} notification{filteredNotifications.length !== 1 ? 's' : ''}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-8 px-4 text-xs"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
