import React, { useState } from 'react';
import { 
  User, 
  Bell, 
  Palette, 
  Database, 
  Download, 
  Upload, 
  Trash2,
  Save,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import { useTask } from '../../contexts/TaskContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { useToast } from '../../hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';

interface SettingsSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

function ProfileSettings() {
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'JD'
  });

  const { toast } = useToast();

  const handleSave = () => {
    // Here you would typically save to a backend
    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
          <span className="text-xl font-semibold text-primary-foreground">{profile.avatar}</span>
        </div>
        <div className="flex-1 space-y-2">
          <div>
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              value={profile.name}
              onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>
        </div>
      </div>
      <Button onClick={handleSave} className="w-full sm:w-auto">
        <Save className="w-4 h-4 mr-2" />
        Save Changes
      </Button>
    </div>
  );
}

function NotificationSettings() {
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: false,
    taskReminders: true,
    weeklyReport: true,
    overdueAlerts: true
  });

  const updateNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label>Email Notifications</Label>
          <p className="text-sm text-muted-foreground">Receive notifications via email</p>
        </div>
        <Switch
          checked={notifications.emailNotifications}
          onCheckedChange={() => updateNotification('emailNotifications')}
        />
      </div>
      
      <Separator />
      
      <div className="flex items-center justify-between">
        <div>
          <Label>Push Notifications</Label>
          <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
        </div>
        <Switch
          checked={notifications.pushNotifications}
          onCheckedChange={() => updateNotification('pushNotifications')}
        />
      </div>
      
      <Separator />
      
      <div className="flex items-center justify-between">
        <div>
          <Label>Task Reminders</Label>
          <p className="text-sm text-muted-foreground">Get reminders for due tasks</p>
        </div>
        <Switch
          checked={notifications.taskReminders}
          onCheckedChange={() => updateNotification('taskReminders')}
        />
      </div>
      
      <Separator />
      
      <div className="flex items-center justify-between">
        <div>
          <Label>Weekly Report</Label>
          <p className="text-sm text-muted-foreground">Receive weekly productivity reports</p>
        </div>
        <Switch
          checked={notifications.weeklyReport}
          onCheckedChange={() => updateNotification('weeklyReport')}
        />
      </div>
      
      <Separator />
      
      <div className="flex items-center justify-between">
        <div>
          <Label>Overdue Alerts</Label>
          <p className="text-sm text-muted-foreground">Get alerted when tasks are overdue</p>
        </div>
        <Switch
          checked={notifications.overdueAlerts}
          onCheckedChange={() => updateNotification('overdueAlerts')}
        />
      </div>
    </div>
  );
}

function AppearanceSettings() {
  const [appearance, setAppearance] = useState({
    theme: 'system',
    compactMode: false,
    showCompletedTasks: true,
    defaultView: 'today'
  });

  const themeOptions = [
    { value: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
    { value: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
    { value: 'system', label: 'System', icon: <Monitor className="w-4 h-4" /> }
  ];

  const viewOptions = [
    { value: 'today', label: 'Today' },
    { value: 'inbox', label: 'Inbox' },
    { value: 'all', label: 'All Tasks' }
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Theme</Label>
        <div className="grid grid-cols-3 gap-2">
          {themeOptions.map((option) => (
            <Button
              key={option.value}
              variant={appearance.theme === option.value ? "default" : "outline"}
              className="flex items-center gap-2 justify-start"
              onClick={() => setAppearance(prev => ({ ...prev, theme: option.value }))}
            >
              {option.icon}
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label>Default View</Label>
        <Select
          value={appearance.defaultView}
          onValueChange={(value) => setAppearance(prev => ({ ...prev, defaultView: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {viewOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <div>
          <Label>Compact Mode</Label>
          <p className="text-sm text-muted-foreground">Reduce spacing and padding</p>
        </div>
        <Switch
          checked={appearance.compactMode}
          onCheckedChange={(checked) => setAppearance(prev => ({ ...prev, compactMode: checked }))}
        />
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <div>
          <Label>Show Completed Tasks</Label>
          <p className="text-sm text-muted-foreground">Display completed tasks in lists</p>
        </div>
        <Switch
          checked={appearance.showCompletedTasks}
          onCheckedChange={(checked) => setAppearance(prev => ({ ...prev, showCompletedTasks: checked }))}
        />
      </div>
    </div>
  );
}

function DataSettings() {
  const { state, dispatch } = useTask();
  const { toast } = useToast();

  const exportData = () => {
    const data = {
      tasks: state.tasks,
      projects: state.projects,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Data exported",
      description: "Your data has been exported successfully.",
    });
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.tasks && data.projects) {
          dispatch({ type: 'SET_TASKS', payload: data.tasks });
          dispatch({ type: 'SET_PROJECTS', payload: data.projects });
          toast({
            title: "Data imported",
            description: "Your data has been imported successfully.",
          });
        } else {
          throw new Error('Invalid file format');
        }
      } catch (error) {
        toast({
          title: "Import failed",
          description: "Failed to import data. Please check the file format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const clearAllData = () => {
    dispatch({ type: 'SET_TASKS', payload: [] });
    dispatch({ type: 'SET_PROJECTS', payload: [] });
    localStorage.clear();
    toast({
      title: "Data cleared",
      description: "All data has been cleared successfully.",
    });
  };

  const storageUsed = new Blob([JSON.stringify({ tasks: state.tasks, projects: state.projects })]).size;
  const storageUsedKB = (storageUsed / 1024).toFixed(2);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Export Data</Label>
          <Button onClick={exportData} variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
          <p className="text-xs text-muted-foreground">
            Download your tasks and projects as a JSON file
          </p>
        </div>

        <div className="space-y-2">
          <Label>Import Data</Label>
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => document.getElementById('import-file')?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Import JSON
            </Button>
            <input
              id="import-file"
              type="file"
              accept=".json"
              className="hidden"
              onChange={importData}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Import tasks and projects from a JSON file
          </p>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label>Storage Usage</Label>
            <p className="text-sm text-muted-foreground">Local storage used by the app</p>
          </div>
          <Badge variant="outline">{storageUsedKB} KB</Badge>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Total Tasks</Label>
            <p className="text-sm text-muted-foreground">Number of tasks in your database</p>
          </div>
          <Badge variant="outline">{state.tasks.length}</Badge>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Total Projects</Label>
            <p className="text-sm text-muted-foreground">Number of projects in your database</p>
          </div>
          <Badge variant="outline">{state.projects.length}</Badge>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div>
          <Label className="text-destructive">Danger Zone</Label>
          <p className="text-sm text-muted-foreground">Irreversible actions</p>
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full sm:w-auto">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All Data
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete all your tasks, 
                projects, and settings from local storage.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={clearAllData} className="bg-destructive text-destructive-foreground">
                Delete Everything
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

export default function SettingsView() {
  const [activeSection, setActiveSection] = useState('profile');

  const sections: SettingsSection[] = [
    {
      id: 'profile',
      title: 'Profile',
      icon: <User className="w-4 h-4" />,
      component: <ProfileSettings />
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: <Bell className="w-4 h-4" />,
      component: <NotificationSettings />
    },
    {
      id: 'appearance',
      title: 'Appearance',
      icon: <Palette className="w-4 h-4" />,
      component: <AppearanceSettings />
    },
    {
      id: 'data',
      title: 'Data & Storage',
      icon: <Database className="w-4 h-4" />,
      component: <DataSettings />
    }
  ];

  const activeComponent = sections.find(section => section.id === activeSection)?.component;

  return (
    <div className="h-full overflow-auto">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your account and application preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <Card className="lg:col-span-1">
            <CardContent className="p-4">
              <nav className="space-y-1">
                {sections.map((section) => (
                  <Button
                    key={section.id}
                    variant={activeSection === section.id ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveSection(section.id)}
                  >
                    {section.icon}
                    <span className="ml-2">{section.title}</span>
                  </Button>
                ))}
              </nav>
            </CardContent>
          </Card>

          {/* Content */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {sections.find(s => s.id === activeSection)?.icon}
                {sections.find(s => s.id === activeSection)?.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeComponent}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}