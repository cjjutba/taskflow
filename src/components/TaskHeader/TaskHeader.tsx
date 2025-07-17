import React from 'react';
import { Plus, Filter, SortAsc, Layers, ChevronDown, MoreHorizontal } from 'lucide-react';
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
    <div className="flex items-center justify-between p-3 sm:p-4 xl:p-6 border-b border-border bg-background flex-shrink-0 min-w-0 w-full task-header-container">
      {/* Left Section - Title and Stats */}
      <div className="flex items-center gap-2 min-w-0 flex-1 mr-3">
        <h1 className="text-lg sm:text-xl xl:text-2xl font-semibold text-foreground truncate task-header-title">{title}</h1>
        <Badge variant="secondary" className="text-xs flex-shrink-0 hidden sm:inline-flex">
          {taskCount} tasks
        </Badge>
        {completedCount > 0 && (
          <Badge variant="outline" className="text-xs flex-shrink-0 border-muted-foreground/20 text-muted-foreground bg-muted/30 hidden xl:inline-flex">
            {completedCount}/{totalCount} completed
          </Badge>
        )}
      </div>

      {/* Right Section - Ultra Compact for 1024px */}
      <div className="flex items-center flex-shrink-0 task-header-controls">
        {/* Primary Actions - Compact Layout */}
        <div className="flex items-center gap-0.5 sm:gap-1 lg:gap-2">
          {/* View Toggle - Compact */}
          <ViewToggle />

          {/* Divider */}
          <div className="w-px h-5 bg-border hidden sm:block mx-0.5 lg:mx-1 task-header-divider" />

          {/* Essential Actions - Ultra Compact */}
          <div className="flex items-center gap-0.5 lg:gap-1">
            {/* Filter Button - Ultra Compact */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    // Base: Very compact for all screens
                    "h-7 px-1.5 gap-1 text-xs transition-all duration-200",
                    // SM: Optimized for 640px-768px range
                    "sm:h-8 sm:px-2 sm:gap-1.5 sm:text-xs",
                    // MD: Better for 768px-1024px range
                    "md:h-8 md:px-2.5 md:gap-1.5 md:text-sm",
                    // XL: Full size
                    "xl:h-9 xl:px-3 xl:gap-2",
                    "hover:bg-muted hover:text-foreground border border-transparent hover:border-border",
                    "task-header-button", // Apply responsive styles
                    activeFilters.length > 0 && "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                  )}
                >
                  <Filter className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 flex-shrink-0 task-header-icon" />
                  <span className="font-medium hidden sm:inline text-xs sm:text-xs md:text-sm">Filter</span>
                  {activeFilters.length > 0 && (
                    <Badge variant="secondary" className="ml-0.5 h-3.5 px-1 text-xs hidden xl:inline-flex task-header-badge">
                      {activeFilters.length}
                    </Badge>
                  )}
                  <ChevronDown className="w-3 h-3 opacity-50 hidden xl:inline ml-0.5 task-header-icon" />
                </Button>
              </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
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

            {/* Sort Button - Ultra Compact */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    // Base: Very compact for all screens
                    "h-7 px-1.5 gap-1 text-xs transition-all duration-200",
                    // SM: Optimized for 640px-768px range
                    "sm:h-8 sm:px-2 sm:gap-1.5 sm:text-xs",
                    // MD: Better for 768px-1024px range
                    "md:h-8 md:px-2.5 md:gap-1.5 md:text-sm",
                    // XL: Full size
                    "xl:h-9 xl:px-3 xl:gap-2",
                    "hover:bg-muted hover:text-foreground border border-transparent hover:border-border",
                    "task-header-button", // Apply responsive styles
                    sortBy && sortBy !== 'dueDate' && "bg-secondary/50 text-secondary-foreground border-secondary hover:bg-secondary/70"
                  )}
                >
                  {sortDirection === 'desc' ? (
                    <SortAsc className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 rotate-180 flex-shrink-0 task-header-icon" />
                  ) : (
                    <SortAsc className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 flex-shrink-0 task-header-icon" />
                  )}
                  <span className="font-medium hidden sm:inline text-xs sm:text-xs md:text-sm">Sort</span>
                  {sortBy && sortBy !== 'dueDate' && (
                    <Badge variant="secondary" className="ml-0.5 h-3.5 px-1 text-xs hidden xl:inline-flex task-header-badge">
                      {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
                    </Badge>
                  )}
                  <ChevronDown className="w-3 h-3 opacity-50 hidden xl:inline ml-0.5 task-header-icon" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-background border-border shadow-lg">
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
          </div>

          {/* Secondary Actions - Ultra Compact */}
          <div className="flex items-center gap-0.5 lg:gap-1 ml-1">
            {/* Divider */}
            <div className="w-px h-5 bg-border hidden lg:block" />

            {/* Add Section - Icon only until XL */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onAddSection}
              className={cn(
                // Base: Very compact
                "h-7 px-1.5 gap-1 text-xs transition-all duration-200 hidden sm:flex",
                // SM: Optimized for 640px-768px range
                "sm:h-8 sm:px-2 sm:gap-1.5",
                // MD: Better for 768px-1024px range
                "md:h-8 md:px-2.5 md:gap-1.5",
                // XL: Full size with text
                "xl:h-9 xl:px-3 xl:gap-2",
                "hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200",
                "border border-transparent",
                "task-header-button" // Apply responsive styles
              )}
            >
              <Layers className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 flex-shrink-0 task-header-icon" />
              <span className="font-medium hidden xl:inline text-xs xl:text-sm">Add Section</span>
            </Button>

            {/* Add Task - Ultra compact, always visible */}
            {showAddButton && (
              <Button
                onClick={onAddTask}
                size="sm"
                className={cn(
                  // Base: Very compact
                  "h-7 px-1.5 gap-1 text-xs transition-all duration-200",
                  // SM: Optimized for 640px-768px range
                  "sm:h-8 sm:px-2 sm:gap-1.5 sm:text-xs",
                  // MD: Better for 768px-1024px range
                  "md:h-8 md:px-2.5 md:gap-1.5 md:text-sm",
                  // XL: Full size
                  "xl:h-9 xl:px-3 xl:gap-2",
                  "bg-blue-600 hover:bg-blue-700 text-white",
                  "shadow-sm hover:shadow-md font-medium",
                  "task-header-button keep-text" // Apply responsive styles but keep text
                )}
              >
                <Plus className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 flex-shrink-0 task-header-icon" />
                <span className="hidden sm:inline text-xs sm:text-xs md:text-sm">Add Task</span>
              </Button>
            )}
          </div>

          {/* Overflow Menu - For very small screens */}
          <div className="flex sm:hidden ml-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 hover:bg-muted"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={onAddSection}>
                  <Layers className="w-4 h-4 mr-2" />
                  Add Section
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onClearFilters()}>
                  <Filter className="w-4 h-4 mr-2" />
                  Clear Filters
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
