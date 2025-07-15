import React from 'react';
import { Calendar, Flag } from 'lucide-react';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { useTask, Task } from '../../contexts/TaskContext';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';

interface TaskMetaProps {
  task: Task;
  showProject?: boolean;
  showPriority?: boolean;
  showDueDate?: boolean;
  className?: string;
}

export function TaskMeta({ 
  task, 
  showProject = true, 
  showPriority = true, 
  showDueDate = true,
  className 
}: TaskMetaProps) {
  const { state } = useTask();
  
  const project = task.projectId 
    ? state.projects.find(p => p.id === task.projectId)
    : null;

  const formatDueDate = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d');
  };

  const getDueDateColor = (date: Date) => {
    if (isPast(date) && !isToday(date)) return 'text-destructive';
    if (isToday(date)) return 'text-warning';
    return 'text-muted-foreground';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-warning';
      case 'medium': return 'text-primary';
      case 'low': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const items = [];

  if (showDueDate && task.dueDate) {
    items.push(
      <div key="due-date" className={cn('flex items-center gap-1', getDueDateColor(task.dueDate))}>
        <Calendar className="w-3 h-3" />
        <span>{formatDueDate(task.dueDate)}</span>
      </div>
    );
  }

  if (showProject && project) {
    items.push(
      <div key="project" className="flex items-center gap-1 text-muted-foreground">
        <div 
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: project.color }}
        />
        <span>{project.name}</span>
      </div>
    );
  }

  if (showPriority) {
    items.push(
      <div key="priority" className={cn('flex items-center gap-1', getPriorityColor(task.priority))}>
        <Flag className="w-3 h-3" />
        <span className="capitalize">{task.priority}</span>
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className={cn('flex items-center gap-3 text-xs', className)}>
      {items}
    </div>
  );
}