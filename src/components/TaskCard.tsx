import React, { useState } from 'react';
import { Edit3 } from 'lucide-react';
import { useTask, Task } from '../contexts/TaskContext';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { TaskActions } from './task/TaskActions';
import { TaskMeta } from './task/TaskMeta';
import { cn } from '../lib/utils';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  compact?: boolean;
  showProject?: boolean;
  className?: string;
}

export default function TaskCard({ 
  task, 
  onEdit, 
  compact = false,
  showProject = true,
  className 
}: TaskCardProps) {
  const { dispatch } = useTask();
  const [isHovered, setIsHovered] = useState(false);

  const toggleTask = () => {
    dispatch({ type: 'TOGGLE_TASK', payload: task.id });
  };

  const getPriorityBorder = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-warning';
      case 'medium': return 'border-l-primary';
      case 'low': return 'border-l-muted-foreground';
      default: return 'border-l-muted-foreground';
    }
  };

  return (
    <div
      className={cn(
        'group bg-card border border-border rounded-lg shadow-task transition-all duration-200 hover:shadow-card border-l-4',
        getPriorityBorder(task.priority),
        compact ? 'p-3' : 'p-4',
        task.completed && 'opacity-60',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <Checkbox
          checked={task.completed}
          onCheckedChange={toggleTask}
          className="mt-1 flex-shrink-0"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 
              className={cn(
                'font-medium leading-tight break-words',
                compact ? 'text-sm' : 'text-sm',
                task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
              )}
            >
              {task.title}
            </h3>
            
            {/* Actions - Desktop */}
            <div className={cn(
              'hidden sm:flex items-center gap-1 transition-opacity duration-200 flex-shrink-0',
              isHovered ? 'opacity-100' : 'opacity-0'
            )}>
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-6 w-6"
                  onClick={() => onEdit(task)}
                >
                  <Edit3 className="w-3 h-3" />
                </Button>
              )}
              <TaskActions task={task} onEdit={onEdit} />
            </div>

            {/* Actions - Mobile (Always visible) */}
            <div className="sm:hidden flex-shrink-0">
              <TaskActions task={task} onEdit={onEdit} />
            </div>
          </div>

          {/* Description */}
          {task.description && !compact && (
            <p className={cn(
              'text-xs leading-relaxed mb-3 break-words',
              task.completed ? 'line-through text-muted-foreground' : 'text-muted-foreground'
            )}>
              {task.description}
            </p>
          )}

          {/* Meta Information */}
          <TaskMeta 
            task={task} 
            showProject={showProject}
            className={compact ? 'text-xs' : undefined}
          />
        </div>
      </div>
    </div>
  );
}