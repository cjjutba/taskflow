import React, { useState } from 'react';
import { Calendar, Flag, Edit3, Trash2, MoreHorizontal, Clock } from 'lucide-react';
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
import { useConfirmation } from '../../contexts/ConfirmationContext';
import { taskConfirmations } from '../../utils/confirmation-configs';

interface BoardTaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  isDragging?: boolean;
}

export default function BoardTaskCard({ task, onEdit, isDragging = false }: BoardTaskCardProps) {
  const { state, dispatch } = useTask();
  const { showConfirmation } = useConfirmation();
  const [isHovered, setIsHovered] = useState(false);

  const handleToggleComplete = () => {
    dispatch({ type: 'TOGGLE_TASK', payload: task.id });
  };

  const handleDelete = () => {
    const confirmationConfig = taskConfirmations.deleteTask(task.title);

    showConfirmation({
      ...confirmationConfig,
      onConfirm: () => {
        dispatch({ type: 'DELETE_TASK', payload: task.id });
      }
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20';
      case 'low':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20';
      default:
        return 'border-border bg-card';
    }
  };

  const getPriorityDot = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-muted-foreground';
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
      const diffTime = taskDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays <= 7) {
        return `${diffDays}d`;
      } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
  const project = task.projectId ? state.projects.find(p => p.id === task.projectId) : null;
  const isHighlighted = state.ui.highlightedTaskId === task.id;

  return (
    <div
      data-task-id={task.id}
      className={cn(
        'task-card bg-card rounded-md border shadow-sm p-1.5 cursor-pointer transition-all duration-200 group',
        'hover:shadow-md hover:border-border/60 hover:bg-muted/10',
        'touch-manipulation select-none overflow-hidden',
        task.completed ? 'opacity-75' : '',
        isOverdue ? 'border-red-200 bg-red-50/30 dark:border-red-800 dark:bg-red-950/20' : 'border-border',
        isDragging && 'opacity-50 rotate-2 scale-105 shadow-lg',
        isHighlighted && 'ring-2 ring-primary/50 border-primary/50 bg-primary/5'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
      onClick={() => !isDragging && onEdit(task)}
    >
      {/* Title and Checkbox Row */}
      <div className="flex items-start gap-1.5 mb-1">
        <Checkbox
          checked={task.completed}
          onCheckedChange={handleToggleComplete}
          onClick={(e) => e.stopPropagation()}
          className="flex-shrink-0 h-3 w-3 mt-0.5"
        />

        <h4 className={cn(
          'font-normal text-xs leading-tight flex-1 line-clamp-2',
          task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
        )}>
          {task.title}
        </h4>

        {/* Actions */}
        <div className={cn(
          'flex items-center transition-opacity duration-200 shrink-0',
          isHovered ? 'opacity-100' : 'opacity-0'
        )}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="p-0.5 h-4 w-4"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="w-2.5 h-2.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32 bg-white border border-border shadow-lg">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}>
                <Edit3 className="w-3 h-3 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-3 h-3 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className={cn(
          'text-xs mb-1.5 leading-snug line-clamp-2 ml-5',
          task.completed ? 'text-muted-foreground/70' : 'text-muted-foreground'
        )}>
          {task.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-1.5 ml-5">
        <div className="flex items-center gap-1 flex-wrap min-w-0">
          {/* Priority Badge */}
          {task.priority && task.priority !== 'none' && (
            <Badge
              variant="outline"
              className={cn(
                "text-xs px-1 py-0 border font-normal h-4 text-xs leading-none",
                task.priority === 'high' && "bg-red-50 text-red-700 border-red-200",
                task.priority === 'medium' && "bg-amber-50/60 text-amber-600 border-amber-200/60",
                task.priority === 'low' && "bg-emerald-50 text-emerald-700 border-emerald-200"
              )}
            >
              {task.priority.charAt(0).toUpperCase()}
            </Badge>
          )}

          {/* Project */}
          {project && (
            <Badge
              variant="secondary"
              className="text-xs px-1 py-0 h-4 leading-none truncate max-w-16"
              title={project.name}
            >
              {project.name}
            </Badge>
          )}
        </div>

        {/* Due Date */}
        {task.dueDate && (
          <div className={cn(
            'flex items-center gap-0.5 text-xs shrink-0',
            isOverdue
              ? 'text-red-600'
              : formatDueDate(task.dueDate) === 'Today'
              ? 'text-amber-600'
              : 'text-muted-foreground'
          )}>
            {isOverdue ? (
              <Clock className="w-2.5 h-2.5" />
            ) : (
              <Calendar className="w-2.5 h-2.5" />
            )}
            <span className="font-normal text-xs">
              {formatDueDate(task.dueDate)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
