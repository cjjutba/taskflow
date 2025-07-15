import React, { useState } from 'react';
import { X, Calendar, Tag, User, Folder } from 'lucide-react';
import { SearchFilters as SearchFiltersType } from '../../types/search';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { DatePickerWithRange } from '../ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { useTask } from '../../contexts/TaskContext';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: SearchFiltersType) => void;
}

export function SearchFilters({ filters, onFiltersChange }: SearchFiltersProps) {
  const { state } = useTask();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    filters.dateRange ? {
      from: filters.dateRange.from,
      to: filters.dateRange.to,
    } : undefined
  );

  const handleFilterChange = (key: keyof SearchFiltersType, value: any) => {
    const newFilters = { ...filters };
    
    if (value === undefined || value === '' || value === 'all') {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    
    onFiltersChange(newFilters);
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      handleFilterChange('dateRange', { from: range.from, to: range.to });
    } else {
      handleFilterChange('dateRange', undefined);
    }
  };

  const clearAllFilters = () => {
    setDateRange(undefined);
    onFiltersChange({});
  };

  const activeFiltersCount = Object.keys(filters).length;

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">Search Filters</h3>
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-xs h-6 px-2"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Active filters */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-1">
          {filters.priority && (
            <Badge variant="secondary" className="text-xs">
              Priority: {filters.priority}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFilterChange('priority', undefined)}
                className="ml-1 h-3 w-3 p-0 hover:bg-transparent"
              >
                <X className="w-2 h-2" />
              </Button>
            </Badge>
          )}
          
          {filters.status && (
            <Badge variant="secondary" className="text-xs">
              Status: {filters.status}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFilterChange('status', undefined)}
                className="ml-1 h-3 w-3 p-0 hover:bg-transparent"
              >
                <X className="w-2 h-2" />
              </Button>
            </Badge>
          )}

          {filters.project && (
            <Badge variant="secondary" className="text-xs">
              Project: {state.projects.find(p => p.id === filters.project)?.name || 'Unknown'}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFilterChange('project', undefined)}
                className="ml-1 h-3 w-3 p-0 hover:bg-transparent"
              >
                <X className="w-2 h-2" />
              </Button>
            </Badge>
          )}

          {filters.dueDate && (
            <Badge variant="secondary" className="text-xs">
              Due: {filters.dueDate}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFilterChange('dueDate', undefined)}
                className="ml-1 h-3 w-3 p-0 hover:bg-transparent"
              >
                <X className="w-2 h-2" />
              </Button>
            </Badge>
          )}

          {filters.dateRange && (
            <Badge variant="secondary" className="text-xs">
              Date range
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDateRangeChange(undefined)}
                className="ml-1 h-3 w-3 p-0 hover:bg-transparent"
              >
                <X className="w-2 h-2" />
              </Button>
            </Badge>
          )}
        </div>
      )}

      {/* Priority Filter */}
      <div className="space-y-2">
        <Label className="text-xs font-medium flex items-center gap-2">
          <Tag className="w-3 h-3" />
          Priority
        </Label>
        <Select
          value={filters.priority || 'all'}
          onValueChange={(value) => handleFilterChange('priority', value)}
        >
          <SelectTrigger className="h-8">
            <SelectValue placeholder="Any priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any priority</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Status Filter */}
      <div className="space-y-2">
        <Label className="text-xs font-medium flex items-center gap-2">
          <Tag className="w-3 h-3" />
          Status
        </Label>
        <Select
          value={filters.status || 'all'}
          onValueChange={(value) => handleFilterChange('status', value)}
        >
          <SelectTrigger className="h-8">
            <SelectValue placeholder="Any status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Project Filter */}
      <div className="space-y-2">
        <Label className="text-xs font-medium flex items-center gap-2">
          <Folder className="w-3 h-3" />
          Project
        </Label>
        <Select
          value={filters.project || 'all'}
          onValueChange={(value) => handleFilterChange('project', value)}
        >
          <SelectTrigger className="h-8">
            <SelectValue placeholder="Any project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any project</SelectItem>
            <SelectItem value="">No project</SelectItem>
            {state.projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Due Date Quick Filter */}
      <div className="space-y-2">
        <Label className="text-xs font-medium flex items-center gap-2">
          <Calendar className="w-3 h-3" />
          Due Date
        </Label>
        <Select
          value={filters.dueDate || 'all'}
          onValueChange={(value) => handleFilterChange('dueDate', value)}
        >
          <SelectTrigger className="h-8">
            <SelectValue placeholder="Any due date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any due date</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="today">Due today</SelectItem>
            <SelectItem value="tomorrow">Due tomorrow</SelectItem>
            <SelectItem value="this-week">Due this week</SelectItem>
            <SelectItem value="next-week">Due next week</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Custom Date Range */}
      <div className="space-y-2">
        <Label className="text-xs font-medium flex items-center gap-2">
          <Calendar className="w-3 h-3" />
          Custom Date Range
        </Label>
        <DatePickerWithRange
          date={dateRange}
          onDateChange={handleDateRangeChange}
          className="w-full"
        />
      </div>

      {/* Search Tips */}
      <div className="pt-2 border-t border-border">
        <Label className="text-xs font-medium mb-2 block">Search Tips</Label>
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Use <code className="bg-muted px-1 rounded">priority:high</code> for high priority tasks</p>
          <p>• Use <code className="bg-muted px-1 rounded">status:overdue</code> for overdue tasks</p>
          <p>• Use <code className="bg-muted px-1 rounded">due:today</code> for tasks due today</p>
          <p>• Press <kbd className="bg-muted px-1 rounded">Ctrl+K</kbd> to open search anywhere</p>
        </div>
      </div>
    </div>
  );
}
