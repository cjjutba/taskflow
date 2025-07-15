import React, { useMemo, useState } from 'react';
import { Plus, Filter, SortAsc } from 'lucide-react';
import { useTask, Task } from '../contexts/TaskContext';
import TaskCard from './TaskCard';

import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface TaskListProps {
  title: string;
  tasks: Task[];
  showAddButton?: boolean;
}

export default function TaskList({ title, tasks, showAddButton = true }: TaskListProps) {
  const { state, dispatch } = useTask();

  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    // Search filter
    if (state.filters.search) {
      const searchLower = state.filters.search.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower)
      );
    }

    // Project filter
    if (state.filters.project) {
      filtered = filtered.filter(task => task.projectId === state.filters.project);
    }

    // Priority filter
    if (state.filters.priority) {
      filtered = filtered.filter(task => task.priority === state.filters.priority);
    }

    // Status filter
    switch (state.filters.status) {
      case 'active':
        filtered = filtered.filter(task => !task.completed);
        break;
      case 'completed':
        filtered = filtered.filter(task => task.completed);
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    // Due date filter
    if (state.filters.dueDate) {
      filtered = filtered.filter(task => {
        if (!task.dueDate) return false;

        const taskDate = new Date(task.dueDate);
        taskDate.setHours(0, 0, 0, 0);

        if (state.filters.dueDate.overdue) {
          return taskDate < (state.filters.dueDate.end || new Date());
        }

        if (state.filters.dueDate.start && state.filters.dueDate.end) {
          return taskDate >= state.filters.dueDate.start && taskDate < state.filters.dueDate.end;
        }

        if (state.filters.dueDate.start) {
          return taskDate >= state.filters.dueDate.start;
        }

        if (state.filters.dueDate.end) {
          return taskDate < state.filters.dueDate.end;
        }

        return true;
      });
    }

    // Sort tasks based on selected sort option
    filtered.sort((a, b) => {
      // Completed tasks always go to bottom unless specifically viewing completed tasks
      if (state.filters.status !== 'completed' && a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }

      const sortBy = state.filters.sortBy || 'dueDate';
      const direction = state.filters.sortDirection === 'desc' ? -1 : 1;

      switch (sortBy) {
        case 'priority': {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          const priorityDiff = (priorityOrder[b.priority] - priorityOrder[a.priority]) * direction;
          if (priorityDiff !== 0) return priorityDiff;
          break;
        }

        case 'dueDate': {
          if (a.dueDate && b.dueDate) {
            return (a.dueDate.getTime() - b.dueDate.getTime()) * direction;
          }
          if (a.dueDate && !b.dueDate) return -1 * direction;
          if (!a.dueDate && b.dueDate) return 1 * direction;
          break;
        }

        case 'createdAt': {
          return (b.createdAt.getTime() - a.createdAt.getTime()) * direction;
        }

        case 'alphabetical': {
          return a.title.localeCompare(b.title) * direction;
        }
      }

      // Fallback to creation date if primary sort is equal
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    return filtered;
  }, [tasks, state.filters]);

  const completedCount = tasks.filter(task => task.completed).length;
  const totalCount = tasks.length;

  const handleEdit = (task: Task) => {
    dispatch({ type: 'OPEN_TASK_MODAL', payload: task });
  };

  const getActiveFilters = () => {
    const filters = [];
    if (state.filters.search) filters.push(`Search: "${state.filters.search}"`);
    if (state.filters.project) {
      const project = state.projects.find(p => p.id === state.filters.project);
      if (project) filters.push(`Project: ${project.name}`);
    }
    if (state.filters.priority) filters.push(`Priority: ${state.filters.priority}`);
    if (state.filters.status !== 'all') filters.push(`Status: ${state.filters.status}`);
    if (state.filters.dueDate) {
      if (state.filters.dueDate.overdue) {
        filters.push('Overdue tasks');
      } else if (state.filters.dueDate.start && state.filters.dueDate.end) {
        const start = state.filters.dueDate.start;
        const end = state.filters.dueDate.end;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (start.getTime() === today.getTime() && end.getTime() === tomorrow.getTime()) {
          filters.push('Due today');
        } else {
          filters.push(`Due: ${start.toLocaleDateString()} - ${end.toLocaleDateString()}`);
        }
      }
    }
    if (state.filters.sortBy && state.filters.sortBy !== 'dueDate') {
      filters.push(`Sort: ${state.filters.sortBy}`);
    }
    return filters;
  };

  const activeFilters = getActiveFilters();

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
          <Badge variant="secondary" className="text-xs">
            {filteredTasks.length} tasks
          </Badge>
          {completedCount > 0 && (
            <Badge variant="outline" className="text-xs">
              {completedCount}/{totalCount} completed
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                Filter
                {activeFilters.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {activeFilters.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white border border-border shadow-lg">
              <DropdownMenuItem onClick={() => dispatch({
                type: 'CLEAR_FILTERS'
              })}>
                All Tasks
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => dispatch({
                type: 'SET_FILTER',
                payload: { key: 'priority', value: 'high' }
              })}>
                High Priority
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => dispatch({
                type: 'SET_FILTER',
                payload: { key: 'status', value: 'active' }
              })}>
                Active Tasks
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => {
                // Set a custom filter for due today
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);

                dispatch({
                  type: 'SET_FILTER',
                  payload: {
                    key: 'dueDate',
                    value: { start: today, end: tomorrow }
                  }
                });
              }}>
                Due Today
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => {
                // Set a custom filter for overdue tasks
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                dispatch({
                  type: 'SET_FILTER',
                  payload: {
                    key: 'dueDate',
                    value: { end: today, overdue: true }
                  }
                });
              }}>
                Overdue
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                {state.filters.sortDirection === 'desc' ? (
                  <SortAsc className="w-4 h-4 rotate-180" />
                ) : (
                  <SortAsc className="w-4 h-4" />
                )}
                Sort
                {state.filters.sortBy && state.filters.sortBy !== 'dueDate' && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {state.filters.sortBy.charAt(0).toUpperCase() + state.filters.sortBy.slice(1)}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white border border-border shadow-lg">
              <DropdownMenuItem onClick={() => dispatch({
                type: 'SET_FILTER',
                payload: { key: 'sortBy', value: 'dueDate' }
              })}>
                Due Date
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => dispatch({
                type: 'SET_FILTER',
                payload: { key: 'sortBy', value: 'priority' }
              })}>
                Priority
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => dispatch({
                type: 'SET_FILTER',
                payload: { key: 'sortBy', value: 'createdAt' }
              })}>
                Created Date
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => dispatch({
                type: 'SET_FILTER',
                payload: { key: 'sortBy', value: 'alphabetical' }
              })}>
                Alphabetical
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => dispatch({
                type: 'SET_FILTER',
                payload: {
                  key: 'sortDirection',
                  value: state.filters.sortDirection === 'asc' ? 'desc' : 'asc'
                }
              })}>
                {state.filters.sortDirection === 'asc' ? 'Sort Descending' : 'Sort Ascending'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Add Task Button */}
          {showAddButton && (
            <Button
              onClick={() => dispatch({ type: 'OPEN_TASK_MODAL' })}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="px-6 py-3 bg-surface border-b border-border">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {activeFilters.map((filter, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {filter}
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-6"
              onClick={() => dispatch({ type: 'CLEAR_FILTERS' })}
            >
              Clear all
            </Button>
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="flex-1 overflow-auto">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No tasks found</h3>
            <p className="text-muted-foreground mb-4 max-w-sm">
              {activeFilters.length > 0 
                ? "No tasks match your current filters. Try adjusting your search criteria."
                : "Get started by creating your first task."
              }
            </p>
            {showAddButton && activeFilters.length === 0 && (
              <Button onClick={() => dispatch({ type: 'OPEN_TASK_MODAL' })}>
                <Plus className="w-4 h-4 mr-2" />
                Create Task
              </Button>
            )}
          </div>
        ) : (
          <div className="p-6 space-y-3">
            {filteredTasks.map((task) => (
              <div key={task.id} className="fade-in">
                <TaskCard task={task} onEdit={handleEdit} />
              </div>
            ))}
          </div>
        )}
      </div>


    </div>
  );
}