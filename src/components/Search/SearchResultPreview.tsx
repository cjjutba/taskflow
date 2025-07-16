import React from 'react';
import { Calendar, Clock, Flag, FolderOpen, User } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { cn } from '../../lib/utils';
import { SearchResult } from '../../services/searchService';
import { Task, Project, Section } from '../../contexts/TaskContext';

interface SearchResultPreviewProps {
  result: SearchResult;
  className?: string;
}

export function SearchResultPreview({ result, className }: SearchResultPreviewProps) {
  const renderTaskPreview = (task: Task) => {
    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
      }).format(date);
    };

    const getPriorityColor = (priority: string) => {
      switch (priority) {
        case 'high': return 'text-red-500 bg-red-50 border-red-200';
        case 'medium': return 'text-yellow-500 bg-yellow-50 border-yellow-200';
        case 'low': return 'text-blue-500 bg-blue-50 border-blue-200';
        default: return 'text-gray-500 bg-gray-50 border-gray-200';
      }
    };

    const isOverdue = task.dueDate && task.dueDate < new Date() && !task.completed;

    return (
      <Card className={cn("w-80 shadow-lg border", className)}>
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-sm leading-tight">{task.title}</h3>
              <Badge 
                variant="outline" 
                className={cn("text-xs px-2 py-0.5", getPriorityColor(task.priority))}
              >
                <Flag className="w-3 h-3 mr-1" />
                {task.priority}
              </Badge>
            </div>

            {/* Description */}
            {task.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {task.description}
              </p>
            )}

            {/* Metadata */}
            <div className="space-y-2">
              {/* Due Date */}
              {task.dueDate && (
                <div className="flex items-center gap-2 text-xs">
                  <Calendar className="w-3 h-3" />
                  <span className={cn(
                    isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'
                  )}>
                    Due {formatDate(task.dueDate)}
                    {isOverdue && ' (Overdue)'}
                  </span>
                </div>
              )}

              {/* Project */}
              {result.projectName && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <FolderOpen className="w-3 h-3" />
                  <span>{result.projectName}</span>
                </div>
              )}

              {/* Section */}
              {result.sectionName && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <User className="w-3 h-3" />
                  <span>{result.sectionName}</span>
                </div>
              )}

              {/* Created Date */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>Created {formatDate(task.createdAt)}</span>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between pt-2 border-t">
              <Badge 
                variant={task.completed ? "default" : "secondary"}
                className="text-xs"
              >
                {task.completed ? '✅ Completed' : '📋 Active'}
              </Badge>
              
              {result.context && (
                <span className="text-xs text-muted-foreground">
                  Found in: {result.context}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderProjectPreview = (project: Project) => {
    return (
      <Card className={cn("w-80 shadow-lg border", className)}>
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: project.color }}
              />
              <h3 className="font-medium text-sm">{project.name}</h3>
            </div>

            {/* Task Count */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FolderOpen className="w-3 h-3" />
              <span>{project.taskCount} tasks</span>
            </div>

            {/* Context */}
            <div className="pt-2 border-t">
              <span className="text-xs text-muted-foreground">
                Found in: Projects
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderSectionPreview = (section: Section) => {
    return (
      <Card className={cn("w-80 shadow-lg border", className)}>
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded bg-purple-100 flex items-center justify-center">
                <span className="text-xs">📑</span>
              </div>
              <h3 className="font-medium text-sm">{section.name}</h3>
            </div>

            {/* Metadata */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>Created {new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: 'numeric',
              }).format(section.createdAt)}</span>
            </div>

            {/* Context */}
            <div className="pt-2 border-t">
              <span className="text-xs text-muted-foreground">
                Found in: {result.context}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  switch (result.type) {
    case 'task':
      return renderTaskPreview(result.data as Task);
    case 'project':
      return renderProjectPreview(result.data as Project);
    case 'section':
      return renderSectionPreview(result.data as Section);
    default:
      return null;
  }
}
