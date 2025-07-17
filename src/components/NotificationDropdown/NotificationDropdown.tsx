import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, X, Clock, Settings, Archive, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { cn } from '../../lib/utils';
import { useNotification } from '../../contexts/NotificationContext';
import { NotificationCategory } from '../../types/notification.types';
import NotificationItem from './NotificationItem';
import BatchedNotificationItem from './BatchedNotificationItem';
import RichNotificationItem from './RichNotificationItem';
import MobileNotificationItem from './MobileNotificationItem';
import NotificationEmptyState from './NotificationEmptyState';
import NotificationModal from './NotificationModal';
import { NotificationSettings } from '../NotificationSettings';
import { animationVariants, animationClasses } from '../../utils/animations';
import { useMobileOptimization } from '../../hooks/useMobileOptimization';

interface NotificationDropdownProps {
  className?: string;
}

export default function NotificationDropdown({ className }: NotificationDropdownProps) {
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    clearAll,
  } = useNotification();

  const [activeTab, setActiveTab] = useState<'all' | NotificationCategory>('all');
  const [isOpen, setIsOpen] = useState(false);
  const [keyboardFocusIndex, setKeyboardFocusIndex] = useState(-1);
  const [showAllModal, setShowAllModal] = useState(false);



  // Initialize mobile optimization
  const {
    isMobile,
    isTablet,
    getMobileStyles,
    getDropdownPosition,
    getNotificationItemStyles,
    triggerHapticFeedback,
    useSwipeGesture,
    usePullToRefresh
  } = useMobileOptimization();

  // Get notifications based on active tab
  const getFilteredNotifications = () => {
    if (activeTab === 'all') {
      return notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return notifications.filter(n => n.category === activeTab).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const filteredNotifications = getFilteredNotifications();

  // Pull to refresh functionality
  const {
    isPulling,
    pullDistance,
    pullProgress,
    onTouchStart: onPullStart,
    onTouchMove: onPullMove,
    onTouchEnd: onPullEnd
  } = usePullToRefresh(async () => {
    // Simulate refresh - in real app, this would fetch new notifications
    await new Promise(resolve => setTimeout(resolve, 1000));
    triggerHapticFeedback('medium');
  });

  // Category counts
  const taskCount = notifications.filter(n => n.category === 'task').length;
  const projectCount = notifications.filter(n => n.category === 'project').length;
  const sectionCount = notifications.filter(n => n.category === 'section').length;

  const handleClearCategory = () => {
    // For simplified system, just clear all notifications
    clearAll();
  };

  return (
    <>
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <motion.div
          whileHover="hover"
          whileTap="tap"
          variants={animationVariants.button}
        >
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
            aria-expanded={isOpen}
            aria-haspopup="menu"
            aria-label={`Notifications (${unreadCount} unread)`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsOpen(!isOpen);
              }
            }}
          >
            <motion.div
              animate={unreadCount > 0 ? { rotate: [0, -10, 10, -10, 0] } : {}}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <Bell className="h-4 w-4" />
            </motion.div>

            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={animationVariants.badge}
                  className="absolute -top-1 -right-1"
                >
                  <Badge
                    variant="destructive"
                    className="h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className={cn(
          "p-0 bg-background border-border shadow-lg overflow-hidden",
          isMobile ? "notification-dropdown-mobile" : "w-96",
          isTablet && "notification-dropdown-tablet"
        )}
        sideOffset={isMobile ? 0 : 8}
        style={isMobile ? getDropdownPosition() : {}}
        asChild
      >
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={animationVariants.dropdownContainer}
          style={{
            ...getMobileStyles()
          }}
          role="menu"
          aria-label="Notifications menu"
          onKeyDown={(e) => {
            // Basic keyboard navigation
            if (e.key === 'Escape') {
              setIsOpen(false);
            }
          }}
        >
          {/* Pull to refresh indicator */}
          {isMobile && isPulling && (
            <motion.div
              className="pull-to-refresh"
              style={{
                transform: `translateX(-50%) rotate(${pullProgress * 180}deg)`,
                opacity: pullProgress
              }}
            >
              <motion.div
                animate={{ rotate: pullProgress > 0.8 ? 360 : 0 }}
                transition={{ duration: 0.5 }}
              >
                <Archive className="h-4 w-4" />
              </motion.div>
            </motion.div>
          )}

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <Check className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
            
            <NotificationSettings />
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as any)}
          className={cn("w-full", isMobile && "notification-tabs-mobile")}
        >
          <div className="px-4 pt-3 pb-2">
            <TabsList className="grid w-full grid-cols-4 h-8">
              <TabsTrigger value="all" className="text-xs">
                All
                {notifications.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                    {notifications.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="task" className="text-xs">
                Tasks
                {taskCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                    {taskCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="section" className="text-xs">
                Sections
                {sectionCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                    {sectionCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="project" className="text-xs">
                Projects
                {projectCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                    {projectCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Content */}
          <TabsContent value={activeTab} className="mt-0">
            <div className="h-80">
              {filteredNotifications.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={animationVariants.fadeIn}
                  >
                    <NotificationEmptyState category={activeTab} />
                  </motion.div>
                </div>
              ) : (
                <ScrollArea
                  className="h-full"
                  onTouchStart={isMobile ? onPullStart : undefined}
                  onTouchMove={isMobile ? onPullMove : undefined}
                  onTouchEnd={isMobile ? onPullEnd : undefined}
                >
                  <motion.div
                    className={cn(
                      "space-y-1 p-2",
                      isMobile && "notification-list-mobile"
                    )}
                    initial="hidden"
                    animate="visible"
                    variants={animationVariants.staggerContainer}
                    style={isMobile ? { paddingTop: `${Math.max(0, pullDistance)}px` } : {}}
                  >
                    <AnimatePresence mode="popLayout">
                      {filteredNotifications.slice(0, 10).map((notification, index) => (
                        <motion.div
                          key={notification.id}
                          layout
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          variants={animationVariants.notificationItem}
                          custom={index}
                          role="menuitem"
                          tabIndex={0}
                          className="notification-item"
                          aria-label={`${notification.title}: ${notification.message}`}
                          aria-setsize={filteredNotifications.length}
                          aria-posinset={index + 1}
                        >
                          {isMobile ? (
                            <MobileNotificationItem
                              notification={notification}
                              index={index}
                            />
                          ) : (notification as any).batchCount ? (
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
              )}
            </div>
          </TabsContent>
        </Tabs>

          {/* Footer */}
          <div className="flex items-center justify-between p-3 border-t border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <motion.div
                whileHover="hover"
                whileTap="tap"
                variants={animationVariants.button}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllModal(true)}
                  className="h-8 px-3 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View All
                </Button>
              </motion.div>

              {filteredNotifications.length > 0 && (
                <motion.div
                  whileHover="hover"
                  whileTap="tap"
                  variants={animationVariants.button}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearCategory}
                    className="h-8 px-3 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Clear All
                  </Button>
                </motion.div>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xs text-muted-foreground"
            >
              {filteredNotifications.length > 10 && `${filteredNotifications.length - 10}+ more`}
              {filteredNotifications.length <= 10 && filteredNotifications.length > 0 &&
                `${filteredNotifications.length} notification${filteredNotifications.length !== 1 ? 's' : ''}`}
              {filteredNotifications.length === 0 && 'No notifications'}
            </motion.div>
          </div>
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>

    {/* Full Notifications Modal */}
    <NotificationModal
      isOpen={showAllModal}
      onClose={() => setShowAllModal(false)}
      initialTab={activeTab}
    />
  </>
  );
}
