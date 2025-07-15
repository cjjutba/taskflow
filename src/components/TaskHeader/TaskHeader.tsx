import React from 'react';
import { Plus, Filter, SortAsc, Layers, ChevronDown } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ViewToggle } from '../ViewToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { cn } from '../../lib/utils';

interface TaskHeaderProps {
  title: string;
  taskCount: number;
  completedCount: number;
  totalCount: number;
  activeFilters: string[];
  showAddButton?: boolean;
  onAddTask: () => void;
  onAddSection: () => void;
  onClearFilters: () => void;
  onFilterChange: (type: string, value: any) => void;
  onSortChange: (type: string, value: any) => void;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export default function TaskHeader({
  title,
  taskCount,
  completedCount,
  totalCount,
  activeFilters,
  showAddButton = true,
  onAddTask,
  onAddSection,
  onClearFilters,
  onFilterChange,
  onSortChange,
  sortBy,
  sortDirection = 'asc'
}: TaskHeaderProps) {
  return (
    <div className="flex items-center justify-between p-6 border-b border-border bg-background flex-shrink-0 min-w-0 w-full">
      {/* Left Section - Title and Stats */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <h1 className="text-2xl font-semibold text-foreground truncate">{title}</h1>
        <Badge variant="secondary" className="text-xs flex-shrink-0 bg-gray-100 text-gray-700 hover:bg-gray-200">
          {taskCount} tasks
        </Badge>
        {completedCount > 0 && (
          <Badge variant="outline" className="text-xs flex-shrink-0 border-muted-foreground/20 text-muted-foreground bg-muted/30">
            {completedCount}/{totalCount} completed
          </Badge>
        )}
      </div>

      {/* Right Section - Controls */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* View Toggle */}
        <ViewToggle />

        {/* Divider */}
        <div className="w-px h-6 bg-border" />

        {/* Filter Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn(
                "gap-2 h-9 px-3 rounded-lg transition-all duration-200",
                "hover:bg-gray-100 hover:text-gray-900",
                "border border-transparent hover:border-gray-200",
                activeFilters.length > 0 && "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
              )}
            >
              <Filter className="w-4 h-4" />
              <span className="font-medium">Filter</span>
              {activeFilters.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs bg-blue-100 text-blue-700">
                  {activeFilters.length}
                </Badge>
              )}
              <ChevronDown className="w-3 h-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white border border-border shadow-lg">
            <DropdownMenuItem onClick={() => onClearFilters()}>
              All Tasks
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange('priority', 'high')}>
              High Priority
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange('status', 'active')}>
              Active Tasks
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const tomorrow = new Date(today);
              tomorrow.setDate(tomorrow.getDate() + 1);
              onFilterChange('dueDate', { start: today, end: tomorrow });
            }}>
              Due Today
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              onFilterChange('dueDate', { end: today, overdue: true });
            }}>
              Overdue
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sort Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn(
                "gap-2 h-9 px-3 rounded-lg transition-all duration-200",
                "hover:bg-gray-100 hover:text-gray-900",
                "border border-transparent hover:border-gray-200",
                sortBy && sortBy !== 'dueDate' && "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
              )}
            >
              {sortDirection === 'desc' ? (
                <SortAsc className="w-4 h-4 rotate-180" />
              ) : (
                <SortAsc className="w-4 h-4" />
              )}
              <span className="font-medium">Sort</span>
              {sortBy && sortBy !== 'dueDate' && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs bg-purple-100 text-purple-700">
                  {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
                </Badge>
              )}
              <ChevronDown className="w-3 h-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-white border border-border shadow-lg">
            <DropdownMenuItem onClick={() => onSortChange('sortBy', 'dueDate')}>
              Due Date
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange('sortBy', 'priority')}>
              Priority
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange('sortBy', 'title')}>
              Title
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange('sortBy', 'createdAt')}>
              Created Date
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange('sortDirection', sortDirection === 'asc' ? 'desc' : 'asc')}>
              {sortDirection === 'asc' ? 'Sort Descending' : 'Sort Ascending'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Divider */}
        <div className="w-px h-6 bg-border" />

        {/* Add Section Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onAddSection}
          className={cn(
            "gap-2 h-9 px-3 rounded-lg transition-all duration-200",
            "hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200",
            "border border-transparent"
          )}
        >
          <Layers className="w-4 h-4" />
          <span className="font-medium">Add Section</span>
        </Button>

        {/* Add Task Button */}
        {showAddButton && (
          <Button
            onClick={onAddTask}
            size="sm"
            className={cn(
              "gap-2 h-9 px-4 rounded-lg transition-all duration-200",
              "bg-blue-600 hover:bg-blue-700 text-white",
              "shadow-sm hover:shadow-md",
              "font-medium"
            )}
          >
            <Plus className="w-4 h-4" />
            Add Task
          </Button>
        )}
      </div>
    </div>
  );
}
