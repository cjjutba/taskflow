import React, { useState } from 'react';
import { 
  Settings, 
  Bell, 
  Clock, 
  CheckCircle, 
  Folder, 
  TrendingUp, 
  Info,
  Moon,
  Volume2,
  VolumeX,
  RotateCcw
} from 'lucide-react';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Slider } from '../ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { useNotification } from '../../contexts/NotificationContext';
import { NotificationSettings as NotificationSettingsType } from '../../types/notification.types';

interface NotificationSettingsProps {
  trigger?: React.ReactNode;
}

export default function NotificationSettings({ trigger }: NotificationSettingsProps) {
  const { settings, updateSettings, resetSettings } = useNotification();
  const [isOpen, setIsOpen] = useState(false);

  const handleSettingChange = (key: keyof NotificationSettingsType, value: any) => {
    updateSettings({ [key]: value });
  };

  const handleReset = () => {
    resetSettings();
  };

  const defaultTrigger = (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
    >
      <Settings className="h-3 w-3" />
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </DialogTitle>
          <DialogDescription>
            Customize when and how you receive notifications to stay productive without being overwhelmed.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Task Notifications */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <h3 className="text-sm font-semibold">Task Notifications</h3>
                <Badge variant="secondary" className="text-xs">
                  {Object.entries(settings).filter(([key, value]) => 
                    key.startsWith('task') && value === true
                  ).length} enabled
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 gap-3 pl-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="taskDueSoon" className="text-sm font-medium">Due Soon Reminders</Label>
                    <p className="text-xs text-muted-foreground">Get notified when tasks are approaching their due date</p>
                  </div>
                  <Switch
                    id="taskDueSoon"
                    checked={settings.taskDueSoon}
                    onCheckedChange={(checked) => handleSettingChange('taskDueSoon', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="taskOverdue" className="text-sm font-medium">Overdue Alerts</Label>
                    <p className="text-xs text-muted-foreground">Get notified when tasks pass their due date</p>
                  </div>
                  <Switch
                    id="taskOverdue"
                    checked={settings.taskOverdue}
                    onCheckedChange={(checked) => handleSettingChange('taskOverdue', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="taskCompleted" className="text-sm font-medium">Completion Confirmations</Label>
                    <p className="text-xs text-muted-foreground">Celebrate when you complete tasks</p>
                  </div>
                  <Switch
                    id="taskCompleted"
                    checked={settings.taskCompleted}
                    onCheckedChange={(checked) => handleSettingChange('taskCompleted', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="taskCreated" className="text-sm font-medium">New Task Alerts</Label>
                    <p className="text-xs text-muted-foreground">Get notified when new tasks are created</p>
                  </div>
                  <Switch
                    id="taskCreated"
                    checked={settings.taskCreated}
                    onCheckedChange={(checked) => handleSettingChange('taskCreated', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="taskUpdated" className="text-sm font-medium">Task Updates</Label>
                    <p className="text-xs text-muted-foreground">Get notified when tasks are modified</p>
                  </div>
                  <Switch
                    id="taskUpdated"
                    checked={settings.taskUpdated}
                    onCheckedChange={(checked) => handleSettingChange('taskUpdated', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="taskDeleted" className="text-sm font-medium">Deletion Confirmations</Label>
                    <p className="text-xs text-muted-foreground">Confirm when tasks are deleted</p>
                  </div>
                  <Switch
                    id="taskDeleted"
                    checked={settings.taskDeleted}
                    onCheckedChange={(checked) => handleSettingChange('taskDeleted', checked)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Project Notifications */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Folder className="h-4 w-4 text-purple-600" />
                <h3 className="text-sm font-semibold">Project Notifications</h3>
                <Badge variant="secondary" className="text-xs">
                  {Object.entries(settings).filter(([key, value]) => 
                    key.startsWith('project') && value === true
                  ).length} enabled
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 gap-3 pl-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="projectMilestone" className="text-sm font-medium">Milestone Celebrations</Label>
                    <p className="text-xs text-muted-foreground">Celebrate project completion milestones (25%, 50%, 75%, 100%)</p>
                  </div>
                  <Switch
                    id="projectMilestone"
                    checked={settings.projectMilestone}
                    onCheckedChange={(checked) => handleSettingChange('projectMilestone', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="projectCreated" className="text-sm font-medium">New Project Alerts</Label>
                    <p className="text-xs text-muted-foreground">Get notified when new projects are created</p>
                  </div>
                  <Switch
                    id="projectCreated"
                    checked={settings.projectCreated}
                    onCheckedChange={(checked) => handleSettingChange('projectCreated', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="projectDeadline" className="text-sm font-medium">Deadline Reminders</Label>
                    <p className="text-xs text-muted-foreground">Get reminded about project deadlines</p>
                  </div>
                  <Switch
                    id="projectDeadline"
                    checked={settings.projectDeadline}
                    onCheckedChange={(checked) => handleSettingChange('projectDeadline', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="projectArchived" className="text-sm font-medium">Archive Notifications</Label>
                    <p className="text-xs text-muted-foreground">Get notified when projects are archived or restored</p>
                  </div>
                  <Switch
                    id="projectArchived"
                    checked={settings.projectArchived}
                    onCheckedChange={(checked) => handleSettingChange('projectArchived', checked)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Productivity Notifications */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-orange-600" />
                <h3 className="text-sm font-semibold">Productivity Insights</h3>
                <Badge variant="secondary" className="text-xs">
                  {[settings.dailySummary, settings.weeklyReview, settings.achievementUnlocked, settings.focusReminder]
                    .filter(Boolean).length} enabled
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 gap-3 pl-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="dailySummary" className="text-sm font-medium">Daily Summary</Label>
                    <p className="text-xs text-muted-foreground">Get a daily recap of your productivity at 6 PM</p>
                  </div>
                  <Switch
                    id="dailySummary"
                    checked={settings.dailySummary}
                    onCheckedChange={(checked) => handleSettingChange('dailySummary', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="weeklyReview" className="text-sm font-medium">Weekly Review</Label>
                    <p className="text-xs text-muted-foreground">Get weekly productivity insights and trends</p>
                  </div>
                  <Switch
                    id="weeklyReview"
                    checked={settings.weeklyReview}
                    onCheckedChange={(checked) => handleSettingChange('weeklyReview', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="achievementUnlocked" className="text-sm font-medium">Achievement Unlocked</Label>
                    <p className="text-xs text-muted-foreground">Celebrate productivity milestones and achievements</p>
                  </div>
                  <Switch
                    id="achievementUnlocked"
                    checked={settings.achievementUnlocked}
                    onCheckedChange={(checked) => handleSettingChange('achievementUnlocked', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="focusReminder" className="text-sm font-medium">Focus Reminders</Label>
                    <p className="text-xs text-muted-foreground">Gentle reminders to stay focused on current tasks</p>
                  </div>
                  <Switch
                    id="focusReminder"
                    checked={settings.focusReminder}
                    onCheckedChange={(checked) => handleSettingChange('focusReminder', checked)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* System Notifications */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-semibold">System Notifications</h3>
                <Badge variant="secondary" className="text-xs">
                  {[settings.dataBackup, settings.tipsTricks, settings.featureUpdate]
                    .filter(Boolean).length} enabled
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 gap-3 pl-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="dataBackup" className="text-sm font-medium">Backup Reminders</Label>
                    <p className="text-xs text-muted-foreground">Periodic reminders to backup your data</p>
                  </div>
                  <Switch
                    id="dataBackup"
                    checked={settings.dataBackup}
                    onCheckedChange={(checked) => handleSettingChange('dataBackup', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="tipsTricks" className="text-sm font-medium">Tips & Tricks</Label>
                    <p className="text-xs text-muted-foreground">Helpful tips to improve your TaskFlow experience</p>
                  </div>
                  <Switch
                    id="tipsTricks"
                    checked={settings.tipsTricks}
                    onCheckedChange={(checked) => handleSettingChange('tipsTricks', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="featureUpdate" className="text-sm font-medium">Feature Updates</Label>
                    <p className="text-xs text-muted-foreground">Get notified about new TaskFlow features</p>
                  </div>
                  <Switch
                    id="featureUpdate"
                    checked={settings.featureUpdate}
                    onCheckedChange={(checked) => handleSettingChange('featureUpdate', checked)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Timing Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-semibold">Timing Settings</h3>
              </div>

              <div className="grid grid-cols-1 gap-4 pl-6">
                <div className="space-y-2">
                  <Label htmlFor="dueSoonHours" className="text-sm font-medium">
                    Due Soon Reminder ({settings.dueSoonHours} hours before)
                  </Label>
                  <Slider
                    id="dueSoonHours"
                    min={1}
                    max={72}
                    step={1}
                    value={[settings.dueSoonHours]}
                    onValueChange={([value]) => handleSettingChange('dueSoonHours', value)}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    How many hours before due date to send reminders
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reminderFrequency" className="text-sm font-medium">Reminder Frequency</Label>
                  <Select
                    value={settings.reminderFrequency}
                    onValueChange={(value: 'once' | 'daily' | 'hourly') =>
                      handleSettingChange('reminderFrequency', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">Once</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    How often to repeat overdue task reminders
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="quietHours" className="text-sm font-medium">Quiet Hours</Label>
                      <p className="text-xs text-muted-foreground">Disable notifications during specific hours</p>
                    </div>
                    <Switch
                      id="quietHours"
                      checked={settings.quietHoursEnabled}
                      onCheckedChange={(checked) => handleSettingChange('quietHoursEnabled', checked)}
                    />
                  </div>

                  {settings.quietHoursEnabled && (
                    <div className="grid grid-cols-2 gap-3 pl-4">
                      <div className="space-y-1">
                        <Label htmlFor="quietStart" className="text-xs">Start Time</Label>
                        <Select
                          value={settings.quietHoursStart}
                          onValueChange={(value) => handleSettingChange('quietHoursStart', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 24 }, (_, i) => {
                              const hour = i.toString().padStart(2, '0');
                              return (
                                <SelectItem key={hour} value={`${hour}:00`}>
                                  {hour}:00
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="quietEnd" className="text-xs">End Time</Label>
                        <Select
                          value={settings.quietHoursEnd}
                          onValueChange={(value) => handleSettingChange('quietHoursEnd', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 24 }, (_, i) => {
                              const hour = i.toString().padStart(2, '0');
                              return (
                                <SelectItem key={hour} value={`${hour}:00`}>
                                  {hour}:00
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Display Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-green-600" />
                <h3 className="text-sm font-semibold">Display Settings</h3>
              </div>

              <div className="grid grid-cols-1 gap-3 pl-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="showBadgeCount" className="text-sm font-medium">Show Badge Count</Label>
                    <p className="text-xs text-muted-foreground">Display unread notification count on the bell icon</p>
                  </div>
                  <Switch
                    id="showBadgeCount"
                    checked={settings.showBadgeCount}
                    onCheckedChange={(checked) => handleSettingChange('showBadgeCount', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="groupSimilar" className="text-sm font-medium">Group Similar Notifications</Label>
                    <p className="text-xs text-muted-foreground">Combine similar notifications to reduce clutter</p>
                  </div>
                  <Switch
                    id="groupSimilar"
                    checked={settings.groupSimilar}
                    onCheckedChange={(checked) => handleSettingChange('groupSimilar', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="autoMarkRead" className="text-sm font-medium">
                    Auto-mark as read after {settings.autoMarkReadAfter} days
                  </Label>
                  <Slider
                    id="autoMarkRead"
                    min={1}
                    max={90}
                    step={1}
                    value={[settings.autoMarkReadAfter]}
                    onValueChange={([value]) => handleSettingChange('autoMarkReadAfter', value)}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Automatically remove old read notifications
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxNotifications" className="text-sm font-medium">
                    Maximum notifications ({settings.maxNotifications})
                  </Label>
                  <Slider
                    id="maxNotifications"
                    min={10}
                    max={500}
                    step={10}
                    value={[settings.maxNotifications]}
                    onValueChange={([value]) => handleSettingChange('maxNotifications', value)}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum number of notifications to keep
                  </p>
                </div>
              </div>
            </div>

            {/* Reset Button */}
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset to Defaults
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
