import React, { useState } from 'react';
import { Calendar, Flag, Edit3, Trash2, MoreHorizontal } from 'lucide-react';
import { useTask, Task } from '../../contexts/TaskContext';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { cn } from '../../lib/utils';

interface TaskListItemProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export default function TaskListItem({ task, onEdit }: TaskListItemProps) {
  const { state, dispatch } = useTask();
  const [isHovered, setIsHovered] = useState(false);
  const isHighlighted = state.ui.highlightedTaskId === task.id;

  const handleToggleComplete = () => {
    dispatch({ type: 'TOGGLE_TASK', payload: task.id });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      dispatch({ type: 'DELETE_TASK', payload: task.id });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-amber-500/80';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const formatDueDate = (date: Date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const taskDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (taskDate.getTime() === today.getTime()) {
      return 'Today';
    } else if (taskDate.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    } else if (taskDate < today) {
      return 'Overdue';
    } else {
      return date.toLocaleDateString();
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
  const project = task.projectId ? state.projects.find(p => p.id === task.projectId) : null;

  return (
    <div
      data-task-id={task.id}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border transition-all duration-200',
        'hover:shadow-sm hover:border-border/60 hover:bg-muted/20',
        'overflow-hidden',
        task.completed ? 'bg-muted/30' : 'bg-card',
        isOverdue ? 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20' : 'border-border',
        isHighlighted && 'ring-2 ring-primary/50 border-primary/50 bg-primary/5'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Checkbox */}
      <Checkbox
        checked={task.completed}
        onCheckedChange={handleToggleComplete}
        className="flex-shrink-0 h-4 w-4"
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h4
              className={cn(
                'font-normal text-sm leading-tight break-words',
                task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
              )}
            >
              {task.title}
            </h4>

            {/* Description */}
            {task.description && (
              <p className={cn(
                'text-xs mt-1 break-words',
                task.completed ? 'text-muted-foreground/70' : 'text-muted-foreground'
              )}>
                {task.description}
              </p>
            )}

            {/* Metadata */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {/* Priority */}
              <div className="flex items-center gap-1">
                <Flag className={cn('w-3 h-3', getPriorityColor(task.priority))} />
                <span className="text-xs text-muted-foreground capitalize">
                  {task.priority}
                </span>
              </div>

              {/* Project */}
              {project && (
                <Badge 
                  variant="secondary" 
                  className="text-xs"
                  style={{ backgroundColor: `${project.color}20`, color: project.color }}
                >
                  {project.name}
                </Badge>
              )}

              {/* Due Date */}
              {task.dueDate && (
                <div className={cn(
                  'flex items-center gap-1 text-xs',
                  isOverdue ? 'text-red-500' :
                  formatDueDate(task.dueDate) === 'Today' ? 'text-amber-600' : 'text-muted-foreground'
                )}>
                  <Calendar className="w-3 h-3" />
                  {formatDueDate(task.dueDate)}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className={cn(
            'flex items-center gap-1 transition-opacity duration-200 flex-shrink-0',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}>
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-6 w-6"
              onClick={() => onEdit(task)}
            >
              <Edit3 className="w-3 h-3" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-6 w-6"
                >
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 bg-white border border-border shadow-lg">
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
