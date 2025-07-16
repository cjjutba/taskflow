import React, { useMemo, useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { useTask } from '../contexts/TaskContext';
import TaskList from '../components/TaskList';
import { Badge } from '../components/ui/badge';
import { PageLoading } from '../components/ui/loading-spinner';
import { useUrlFilters } from '../hooks/useUrlFilters';
import { useTaskHighlight } from '../hooks/useTaskHighlight';

export default function TodayPage() {
  const { state } = useTask();
  const { filters, updateFilter } = useUrlFilters();
  const { highlightedTaskId, scrollToTask, showTaskNotFound } = useTaskHighlight();
  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const { todayTasks, overdueTasks, stats, filteredTasks } = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Tasks due today
    let todayTasks = state.tasks.filter(task =>
      task.dueDate &&
      task.dueDate >= today &&
      task.dueDate < tomorrow
    );

    // Overdue tasks from previous days
    let overdueTasks = state.tasks.filter(task =>
      !task.completed &&
      task.dueDate &&
      task.dueDate < today
    );

    // Apply URL filters
    const allTasks = [...overdueTasks, ...todayTasks];
    let filteredTasks = allTasks;

    if (filters.search) {
      filteredTasks = filteredTasks.filter(task =>
        task.title.toLowerCase().includes(filters.search!.toLowerCase()) ||
        task.description?.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }

    if (filters.priority) {
      filteredTasks = filteredTasks.filter(task => task.priority === filters.priority);
    }

    if (filters.status) {
      if (filters.status === 'completed') {
        filteredTasks = filteredTasks.filter(task => task.completed);
      } else if (filters.status === 'pending') {
        filteredTasks = filteredTasks.filter(task => !task.completed);
      }
    }

    return { todayTasks, overdueTasks, filteredTasks };
  }, [state.tasks, filters]);

  // Validate highlighted task belongs to this page
  useEffect(() => {
    if (highlightedTaskId) {
      const allTasks = [...overdueTasks, ...todayTasks];
      const taskExists = allTasks.find(task => task.id === highlightedTaskId);

      if (taskExists) {
        // Task belongs to this page, scroll to it
        scrollToTask(highlightedTaskId);
      } else {
        // Task doesn't belong to this page - show helpful notification
        showTaskNotFound(highlightedTaskId, 'Today');
      }
    }
  }, [highlightedTaskId, overdueTasks, todayTasks, scrollToTask, showTaskNotFound]);

  // Show loading state
  if (isLoading) {
    return <PageLoading message="Loading today's tasks..." />;
  }

  return (
    <div className="h-full flex flex-col">

      {/* Task List */}
      <div className="flex-1 overflow-hidden">
        <TaskList
          title={`Today's Tasks${overdueTasks.length > 0 ? ' & Overdue' : ''}`}
          tasks={filteredTasks}
          showAddButton={true}
        />
      </div>
    </div>
  );
}
