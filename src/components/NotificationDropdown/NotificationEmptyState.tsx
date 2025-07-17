import React from 'react';
import { 
  Bell, 
  CheckCircle, 
  Folder, 
  TrendingUp, 
  Settings,
  Sparkles
} from 'lucide-react';
import { NotificationCategory } from '../../types/notification.types';

interface NotificationEmptyStateProps {
  category: 'all' | NotificationCategory;
}

const getEmptyStateContent = (category: 'all' | NotificationCategory) => {
  switch (category) {
    case 'all':
      return {
        icon: Bell,
        title: 'No notifications',
        message: 'You\'re all caught up! New notifications will appear here.',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
      };
    case 'task':
      return {
        icon: CheckCircle,
        title: 'No task notifications',
        message: 'Task updates, due dates, and completions will appear here.',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
      };
    case 'project':
      return {
        icon: Folder,
        title: 'No project notifications',
        message: 'Project milestones and updates will appear here.',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
      };
    case 'productivity':
      return {
        icon: TrendingUp,
        title: 'No productivity insights',
        message: 'Daily summaries and achievements will appear here.',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
      };
    case 'system':
      return {
        icon: Settings,
        title: 'No system notifications',
        message: 'App updates and tips will appear here.',
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
      };
    default:
      return {
        icon: Bell,
        title: 'No notifications',
        message: 'You\'re all caught up!',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
      };
  }
};

export default function NotificationEmptyState({ category }: NotificationEmptyStateProps) {
  const { icon: Icon, title, message, color, bgColor } = getEmptyStateContent(category);

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className={`w-16 h-16 rounded-full ${bgColor} flex items-center justify-center mb-4`}>
        <Icon className={`w-8 h-8 ${color}`} />
      </div>
      
      <h3 className="text-sm font-medium text-foreground mb-2">
        {title}
      </h3>
      
      <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
        {message}
      </p>
      
      {category === 'all' && (
        <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="w-3 h-3" />
          <span>Stay productive with TaskFlow!</span>
        </div>
      )}
    </div>
  );
}
