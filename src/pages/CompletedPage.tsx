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
      {/* Completed Tasks Overview */}
      <div className="flex-shrink-0 p-6 border-b border-border">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h1 className="text-2xl font-semibold text-foreground">Completed Tasks</h1>
            <Badge variant="secondary" className="ml-2">
              {stats.totalCompleted} completed
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Review your accomplishments and manage completed tasks
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold text-green-600">{stats.totalCompleted}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Today</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.completedToday}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">This Week</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.completedThisWeek}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg. Days</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.averageCompletionTime}</p>
                </div>
                <Filter className="w-8 h-8 text-orange-600/60" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Bulk Actions */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <Input
              placeholder="Search completed tasks..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-64"
            />

            <Select 
              value={filters.dateRange} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.project} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, project: value }))}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {state.projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: project.color }}
                      />
                      {project.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Operations */}
          {filteredTasks.length > 0 && (
            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedTasks.length === filteredTasks.length}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm font-medium">
                  {selectedTasks.length > 0 
                    ? `${selectedTasks.length} selected` 
                    : 'Select all'
                  }
                </span>
              </div>

              {selectedTasks.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleBulkRestore}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Restore
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Completed Tasks</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to permanently delete {selectedTasks.length} completed task(s)? 
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleBulkDelete}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

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
