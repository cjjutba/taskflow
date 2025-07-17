import React, { useMemo, useState } from 'react';
import { Plus, Filter, SortAsc, Layers } from 'lucide-react';
import { useTask, Task } from '../contexts/TaskContext';
import TaskCard from './TaskCard';
import { ViewToggle } from './ViewToggle';
import SectionModal from './SectionModal';
import ListView from './ListView/ListView';
import BoardView from './BoardView/BoardView';
import TaskHeader from './TaskHeader/TaskHeader';

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
  const [sectionModalOpen, setSectionModalOpen] = useState(false);

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
    dispatch({ type: 'OPEN_TASK_MODAL', payload: { task } });
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

  const handleFilterChange = (type: string, value: any) => {
    dispatch({
      type: 'SET_FILTER',
      payload: { key: type, value }
    });
  };

  const handleSortChange = (type: string, value: any) => {
    dispatch({
      type: 'SET_FILTER',
      payload: { key: type, value }
    });
  };

  return (
    <div className="h-full flex flex-col min-w-0">
      {/* Enhanced Header */}
      <TaskHeader
        title={title}
        taskCount={filteredTasks.length}
        completedCount={completedCount}
        totalCount={totalCount}
        activeFilters={activeFilters}
        showAddButton={showAddButton}
        onAddTask={() => dispatch({ type: 'OPEN_TASK_MODAL', payload: {} })}
        onAddSection={() => setSectionModalOpen(true)}
        onClearFilters={() => dispatch({ type: 'CLEAR_FILTERS' })}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        sortBy={state.filters.sortBy}
        sortDirection={state.filters.sortDirection}
      />

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

      {/* Task List - Content area with proper scrolling */}
      <div className="flex-1 overflow-hidden min-w-0">
        {state.ui.viewMode === 'list' ? (
          <div className="h-full overflow-auto">
            <ListView
              tasks={filteredTasks}
              onEdit={handleEdit}
              onAddSection={() => setSectionModalOpen(true)}
            />
          </div>
        ) : (
          <div className="h-full w-full">
            <BoardView
              tasks={filteredTasks}
              onEdit={handleEdit}
              onAddSection={() => setSectionModalOpen(true)}
            />
          </div>
        )}
      </div>

      {/* Section Modal */}
      <SectionModal
        isOpen={sectionModalOpen}
        onClose={() => setSectionModalOpen(false)}
      />
    </div>
  );
}