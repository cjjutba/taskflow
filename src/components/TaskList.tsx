import React, { useMemo, useState } from 'react';
import { Plus, Filter, SortAsc } from 'lucide-react';
import { useTask, Task } from '../contexts/TaskContext';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface TaskListProps {
  title: string;
  tasks: Task[];
  showAddButton?: boolean;
}

export default function TaskList({ title, tasks, showAddButton = true }: TaskListProps) {
  const { state, dispatch } = useTask();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

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

    // Sort tasks: incomplete first, then by priority, then by due date
    filtered.sort((a, b) => {
      // Completed tasks go to bottom
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }

      // Priority sorting (high -> medium -> low)
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Due date sorting (soonest first)
      if (a.dueDate && b.dueDate) {
        return a.dueDate.getTime() - b.dueDate.getTime();
      }
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;

      // Creation date (newest first)
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    return filtered;
  }, [tasks, state.filters]);

  const completedCount = tasks.filter(task => task.completed).length;
  const totalCount = tasks.length;

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
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
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>All Tasks</DropdownMenuItem>
              <DropdownMenuItem>High Priority</DropdownMenuItem>
              <DropdownMenuItem>Due Today</DropdownMenuItem>
              <DropdownMenuItem>Overdue</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <SortAsc className="w-4 h-4" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem>Due Date</DropdownMenuItem>
              <DropdownMenuItem>Priority</DropdownMenuItem>
              <DropdownMenuItem>Created Date</DropdownMenuItem>
              <DropdownMenuItem>Alphabetical</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Add Task Button */}
          {showAddButton && (
            <Button 
              onClick={() => setIsModalOpen(true)}
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
              <Button onClick={() => setIsModalOpen(true)}>
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

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        task={editingTask}
      />
    </div>
  );
}