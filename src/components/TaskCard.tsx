import React, { useState } from 'react';
import { Calendar, FolderOpen, MoreVertical, Trash2, Edit3, Flag } from 'lucide-react';
import { useTask, Task } from '../contexts/TaskContext';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { format, isToday, isTomorrow, isPast } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
}

export default function TaskCard({ task, onEdit }: TaskCardProps) {
  const { state, dispatch } = useTask();
  const [isHovered, setIsHovered] = useState(false);

  const project = task.projectId 
    ? state.projects.find(p => p.id === task.projectId)
    : null;

  const toggleTask = () => {
    dispatch({ type: 'TOGGLE_TASK', payload: task.id });
  };

  const deleteTask = () => {
    dispatch({ type: 'DELETE_TASK', payload: task.id });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-warning';
      case 'medium': return 'text-primary';
      case 'low': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const getPriorityBorder = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-warning';
      case 'medium': return 'border-l-primary';
      case 'low': return 'border-l-muted-foreground';
      default: return 'border-l-muted-foreground';
    }
  };

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

  return (
    <div
      className={`bg-card border border-border rounded-lg p-4 shadow-task transition-all duration-200 hover:shadow-card border-l-4 ${getPriorityBorder(task.priority)} ${
        task.completed ? 'opacity-60' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <Checkbox
          checked={task.completed}
          onCheckedChange={toggleTask}
          className="mt-1"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 
              className={`font-medium text-sm leading-tight ${
                task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
              }`}
            >
              {task.title}
            </h3>
            
            {/* Actions */}
            <div className={`flex items-center gap-1 transition-opacity duration-200 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}>
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
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
                    <MoreVertical className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => onEdit?.(task)}>
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={deleteTask}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <p className={`text-xs mt-1 leading-relaxed ${
              task.completed ? 'line-through text-muted-foreground' : 'text-muted-foreground'
            }`}>
              {task.description}
            </p>
          )}

          {/* Meta Information */}
          <div className="flex items-center gap-3 mt-3 text-xs">
            {/* Due Date */}
            {task.dueDate && (
              <div className={`flex items-center gap-1 ${getDueDateColor(task.dueDate)}`}>
                <Calendar className="w-3 h-3" />
                <span>{formatDueDate(task.dueDate)}</span>
              </div>
            )}

            {/* Project */}
            {project && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
                <span>{project.name}</span>
              </div>
            )}

            {/* Priority */}
            <div className={`flex items-center gap-1 ${getPriorityColor(task.priority)}`}>
              <Flag className="w-3 h-3" />
              <span className="capitalize">{task.priority}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}