import React, { useMemo, useState, useEffect } from 'react';
import { Inbox, MoreHorizontal } from 'lucide-react';
import { useTask } from '../contexts/TaskContext';
import TaskList from '../components/TaskList';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import { PageLoading } from '../components/ui/loading-spinner';
import { useUrlFilters } from '../hooks/useUrlFilters';
import { useTaskHighlight } from '../hooks/useTaskHighlight';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

export default function InboxPage() {
  const { state, dispatch } = useTask();
  const { filters } = useUrlFilters();
  const { highlightedTaskId, scrollToTask, showTaskNotFound } = useTaskHighlight();
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [bulkProject, setBulkProject] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const { inboxTasks, filteredTasks } = useMemo(() => {
    // Tasks without project assignment
    let inboxTasks = state.tasks.filter(task => !task.projectId && !task.completed);

    // Apply URL filters
    let filteredTasks = inboxTasks;

    if (filters.search) {
      filteredTasks = filteredTasks.filter(task =>
        task.title.toLowerCase().includes(filters.search!.toLowerCase()) ||
        task.description?.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }

    if (filters.priority) {
      filteredTasks = filteredTasks.filter(task => task.priority === filters.priority);
    }

    return { inboxTasks, filteredTasks };
  }, [state.tasks, filters]);

  // Validate highlighted task belongs to this page
  useEffect(() => {
    if (highlightedTaskId) {
      const taskExists = inboxTasks.find(task => task.id === highlightedTaskId);

      if (taskExists) {
        // Task belongs to this page, scroll to it
        scrollToTask(highlightedTaskId);
      } else {
        // Task doesn't belong to this page
        showTaskNotFound(highlightedTaskId, 'Inbox');
      }
    }
  }, [highlightedTaskId, inboxTasks, scrollToTask, showTaskNotFound]);

  // Show loading state
  if (isLoading) {
    return <PageLoading message="Loading inbox..." />;
  }

  const handleSelectTask = (taskId: string, checked: boolean) => {
    if (checked) {
      setSelectedTasks(prev => [...prev, taskId]);
    } else {
      setSelectedTasks(prev => prev.filter(id => id !== taskId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTasks(inboxTasks.map(task => task.id));
    } else {
      setSelectedTasks([]);
    }
  };

  const handleBulkAssignProject = () => {
    if (bulkProject && selectedTasks.length > 0) {
      selectedTasks.forEach(taskId => {
        const task = state.tasks.find(t => t.id === taskId);
        if (task) {
          dispatch({
            type: 'UPDATE_TASK',
            payload: { ...task, projectId: bulkProject, updatedAt: new Date() }
          });
        }
      });
      setSelectedTasks([]);
      setBulkProject('');
    }
  };

  const handleBulkDelete = () => {
    selectedTasks.forEach(taskId => {
      dispatch({ type: 'DELETE_TASK', payload: taskId });
    });
    setSelectedTasks([]);
  };

  const handleQuickAssign = (taskId: string, projectId: string) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (task) {
      dispatch({
        type: 'UPDATE_TASK',
        payload: { ...task, projectId, updatedAt: new Date() }
      });
    }
  };

  return (
    <div className="h-full flex flex-col">

      {/* Task List with Enhanced Features */}
      <div className="flex-1 overflow-hidden">
        <TaskList
          title="Unassigned Tasks"
          tasks={filteredTasks}
          showAddButton={true}
        />
      </div>
    </div>
  );
}
