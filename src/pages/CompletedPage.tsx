import React, { useMemo, useState, useEffect } from 'react';
import { CheckCircle, RotateCcw, Trash2, Calendar, BarChart3, Filter } from 'lucide-react';
import { useTask } from '../contexts/TaskContext';
import TaskList from '../components/TaskList';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { PageLoading, SectionLoading } from '../components/ui/loading-spinner';
import { useUrlFilters } from '../hooks/useUrlFilters';
import { useTaskHighlight } from '../hooks/useTaskHighlight';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Checkbox } from '../components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';

interface CompletedStats {
  totalCompleted: number;
  completedToday: number;
  completedThisWeek: number;
  completedThisMonth: number;
  averageCompletionTime: number;
  projectBreakdown: { [key: string]: number };
  priorityBreakdown: { high: number; medium: number; low: number };
}

export default function CompletedPage() {
  const { state, dispatch } = useTask();
  const { filters: urlFilters } = useUrlFilters();
  const { highlightedTaskId, scrollToTask, showTaskNotFound } = useTaskHighlight();
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    project: 'all',
    priority: 'all',
    search: '',
    dateRange: 'all', // all, today, week, month
  });

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const { completedTasks, filteredTasks, stats, urlFilteredTasks } = useMemo(() => {
    let completedTasks = state.tasks.filter(task => task.completed);

    // Apply URL filters first
    let urlFilteredTasks = completedTasks;

    if (urlFilters.search) {
      urlFilteredTasks = urlFilteredTasks.filter(task =>
        task.title.toLowerCase().includes(urlFilters.search!.toLowerCase()) ||
        task.description?.toLowerCase().includes(urlFilters.search!.toLowerCase())
      );
    }

    if (urlFilters.priority) {
      urlFilteredTasks = urlFilteredTasks.filter(task => task.priority === urlFilters.priority);
    }

    if (urlFilters.project) {
      urlFilteredTasks = urlFilteredTasks.filter(task => task.projectId === urlFilters.project);
    }
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    const monthAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

    // Calculate statistics
    const completedToday = completedTasks.filter(task => 
      task.updatedAt >= today
    ).length;

    const completedThisWeek = completedTasks.filter(task => 
      task.updatedAt >= weekAgo
    ).length;

    const completedThisMonth = completedTasks.filter(task => 
      task.updatedAt >= monthAgo
    ).length;

    // Calculate average completion time (days from creation to completion)
    const completionTimes = completedTasks
      .filter(task => task.createdAt && task.updatedAt)
      .map(task => {
        const created = new Date(task.createdAt);
        const completed = new Date(task.updatedAt);
        return Math.floor((completed.getTime() - created.getTime()) / (24 * 60 * 60 * 1000));
      });
    
    const averageCompletionTime = completionTimes.length > 0 
      ? Math.round(completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length)
      : 0;

    // Project breakdown
    const projectBreakdown: { [key: string]: number } = {};
    state.projects.forEach(project => {
      projectBreakdown[project.name] = completedTasks.filter(
        task => task.projectId === project.id
      ).length;
    });
    projectBreakdown['Unassigned'] = completedTasks.filter(
      task => !task.projectId
    ).length;

    // Priority breakdown
    const priorityBreakdown = {
      high: completedTasks.filter(task => task.priority === 'high').length,
      medium: completedTasks.filter(task => task.priority === 'medium').length,
      low: completedTasks.filter(task => task.priority === 'low').length,
    };

    const stats: CompletedStats = {
      totalCompleted: completedTasks.length,
      completedToday,
      completedThisWeek,
      completedThisMonth,
      averageCompletionTime,
      projectBreakdown,
      priorityBreakdown,
    };

    // Apply filters
    let filteredTasks = [...completedTasks];

    // Date range filter
    switch (filters.dateRange) {
      case 'today':
        filteredTasks = filteredTasks.filter(task => task.updatedAt >= today);
        break;
      case 'week':
        filteredTasks = filteredTasks.filter(task => task.updatedAt >= weekAgo);
        break;
      case 'month':
        filteredTasks = filteredTasks.filter(task => task.updatedAt >= monthAgo);
        break;
    }

    // Project filter
    if (filters.project && filters.project !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.projectId === filters.project);
    }

    // Priority filter
    if (filters.priority && filters.priority !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.priority === filters.priority);
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredTasks = filteredTasks.filter(task =>
        task.title.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower)
      );
    }

    return { completedTasks, filteredTasks, stats, urlFilteredTasks };
  }, [state.tasks, state.projects, filters, urlFilters]);

  // Validate highlighted task belongs to this page
  useEffect(() => {
    if (highlightedTaskId) {
      const taskExists = completedTasks.find(task => task.id === highlightedTaskId);

      if (taskExists) {
        // Task belongs to this page, scroll to it
        scrollToTask(highlightedTaskId);
      } else {
        // Task doesn't belong to this page
        showTaskNotFound(highlightedTaskId, 'Completed');
      }
    }
  }, [highlightedTaskId, completedTasks, scrollToTask, showTaskNotFound]);

  // Show loading state
  if (isLoading) {
    return <PageLoading message="Loading completed tasks..." />;
  }

  const handleRestoreTask = (taskId: string) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (task) {
      dispatch({
        type: 'UPDATE_TASK',
        payload: { ...task, completed: false, updatedAt: new Date() }
      });
    }
  };

  const handleBulkRestore = () => {
    selectedTasks.forEach(taskId => {
      handleRestoreTask(taskId);
    });
    setSelectedTasks([]);
  };

  const handleDeleteTask = (taskId: string) => {
    dispatch({ type: 'DELETE_TASK', payload: taskId });
  };

  const handleBulkDelete = () => {
    selectedTasks.forEach(taskId => {
      handleDeleteTask(taskId);
    });
    setSelectedTasks([]);
  };

  const handleSelectTask = (taskId: string, checked: boolean) => {
    if (checked) {
      setSelectedTasks(prev => [...prev, taskId]);
    } else {
      setSelectedTasks(prev => prev.filter(id => id !== taskId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTasks(filteredTasks.map(task => task.id));
    } else {
      setSelectedTasks([]);
    }
  };

  return (
    <div className="h-full flex flex-col">

      {/* Task List */}
      <div className="flex-1 overflow-hidden">
        <TaskList 
          title="Completed Tasks"
          tasks={filteredTasks}
          showAddButton={false}
        />
      </div>
    </div>
  );
}
