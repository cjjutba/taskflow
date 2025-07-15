import React, { useMemo, useState, useEffect } from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle, Target } from 'lucide-react';
import { useTask } from '../contexts/TaskContext';
import TaskList from '../components/TaskList';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { PageLoading, SectionLoading } from '../components/ui/loading-spinner';
import { useUrlFilters } from '../hooks/useUrlFilters';

interface TodayStats {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  highPriorityTasks: number;
  mediumPriorityTasks: number;
  lowPriorityTasks: number;
  completionRate: number;
}

export default function TodayPage() {
  const { state } = useTask();
  const { filters, updateFilter } = useUrlFilters();
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(false);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Simulate stats recalculation when filters change
  useEffect(() => {
    if (!isLoading && (filters.search || filters.priority || filters.status)) {
      setIsStatsLoading(true);
      const timer = setTimeout(() => {
        setIsStatsLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [filters, isLoading]);

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

    // Calculate statistics
    const totalTasks = todayTasks.length;
    const completedTasks = todayTasks.filter(task => task.completed).length;
    const activeTodayTasks = todayTasks.filter(task => !task.completed);
    
    const stats: TodayStats = {
      totalTasks,
      completedTasks,
      overdueTasks: overdueTasks.length,
      highPriorityTasks: activeTodayTasks.filter(task => task.priority === 'high').length,
      mediumPriorityTasks: activeTodayTasks.filter(task => task.priority === 'medium').length,
      lowPriorityTasks: activeTodayTasks.filter(task => task.priority === 'low').length,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    };

    return { todayTasks, overdueTasks, stats, filteredTasks };
  }, [state.tasks, filters]);

  // Show loading state
  if (isLoading) {
    return <PageLoading message="Loading today's tasks..." />;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Today's Overview Stats */}
      <div className="flex-shrink-0 p-6 border-b border-border">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-semibold text-foreground">Today</h1>
            <Badge variant="secondary" className="ml-2">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'short', 
                day: 'numeric' 
              })}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Focus on what matters most today
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {isStatsLoading && <SectionLoading className="col-span-full" />}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalTasks}</p>
                </div>
                <Target className="w-8 h-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completedTasks}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{stats.overdueTasks}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Progress</p>
                  <p className="text-2xl font-bold text-primary">{stats.completionRate}%</p>
                </div>
                <Clock className="w-8 h-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Today's Progress</span>
            <span className="text-sm text-muted-foreground">
              {stats.completedTasks} of {stats.totalTasks} completed
            </span>
          </div>
          <Progress value={stats.completionRate} className="h-2" />
        </div>

        {/* Priority Breakdown */}
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-muted-foreground">High Priority:</span>
            <span className="font-medium">{stats.highPriorityTasks}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-muted-foreground">Medium Priority:</span>
            <span className="font-medium">{stats.mediumPriorityTasks}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-muted-foreground">Low Priority:</span>
            <span className="font-medium">{stats.lowPriorityTasks}</span>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-hidden">
        <TaskList
          title={`Today's Tasks${stats.overdueTasks > 0 ? ' & Overdue' : ''}`}
          tasks={filteredTasks}
          showAddButton={true}
        />
      </div>
    </div>
  );
}
