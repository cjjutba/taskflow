import React, { useMemo, useState, useEffect } from 'react';
import {
  BarChart3, TrendingUp, Target, Clock, Calendar, CheckCircle, AlertTriangle,
  Package, ArrowRight, Filter, Folder, CheckSquare
} from 'lucide-react';
import { useTask } from '../contexts/TaskContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { PageLoading, SectionLoading } from '../components/ui/loading-spinner';

interface AnalyticsData {
  overview: {
    totalTasks: number;
    completedTasks: number;
    activeTasks: number;
    completionRate: number;
    overdueTasks: number;
  };
  productivity: {
    todayCompleted: number;
    weekCompleted: number;
    monthCompleted: number;
    averageDaily: number;
    streak: number;
  };
  projects: {
    [key: string]: {
      name: string;
      color: string;
      total: number;
      completed: number;
      completionRate: number;
    };
  };
  priorities: {
    high: { total: number; completed: number };
    medium: { total: number; completed: number };
    low: { total: number; completed: number };
  };
  timeAnalysis: {
    averageCompletionDays: number;
    oldestActiveTask: number;
    recentActivity: Array<{
      date: string;
      created: number;
      completed: number;
    }>;
  };
  // New comprehensive analytics
  todayAnalytics: {
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    highPriorityTasks: number;
    mediumPriorityTasks: number;
    lowPriorityTasks: number;
    completionRate: number;
  };
  inboxAnalytics: {
    totalUnassigned: number;
    recentTasks: number;
    urgentTasks: number;
    oldestTaskDays: number;
  };
  allTasksAnalytics: {
    totalActive: number;
    highPriority: number;
    mediumPriority: number;
    lowPriority: number;
    overdue: number;
    dueToday: number;
    dueTomorrow: number;
    noDueDate: number;
  };
  completedAnalytics: {
    totalCompleted: number;
    completedToday: number;
    completedThisWeek: number;
    completedThisMonth: number;
    averageCompletionTime: number;
    priorityBreakdown: { high: number; medium: number; low: number };
  };
}

export default function AnalyticsPage() {
  const { state } = useTask();
  const [isLoading, setIsLoading] = useState(true);

  const analytics = useMemo((): AnalyticsData => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
    const weekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    const monthAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

    // Overview metrics
    const totalTasks = state.tasks.length;
    const completedTasks = state.tasks.filter(task => task.completed).length;
    const activeTasks = totalTasks - completedTasks;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const overdueTasks = state.tasks.filter(task =>
      !task.completed && task.dueDate && task.dueDate < today
    ).length;

    // Productivity metrics
    const todayCompleted = state.tasks.filter(task => 
      task.completed && task.updatedAt >= today
    ).length;

    const weekCompleted = state.tasks.filter(task => 
      task.completed && task.updatedAt >= weekAgo
    ).length;

    const monthCompleted = state.tasks.filter(task => 
      task.completed && task.updatedAt >= monthAgo
    ).length;

    const averageDaily = monthCompleted > 0 ? Math.round(monthCompleted / 30) : 0;

    // Calculate completion streak (consecutive days with completed tasks)
    let streak = 0;
    let currentDate = new Date(today);
    while (streak < 30) { // Check up to 30 days back
      const dayStart = new Date(currentDate);
      const dayEnd = new Date(currentDate);
      dayEnd.setDate(dayEnd.getDate() + 1);
      
      const hasCompletedTask = state.tasks.some(task => 
        task.completed && 
        task.updatedAt >= dayStart && 
        task.updatedAt < dayEnd
      );
      
      if (hasCompletedTask) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Project analysis
    const projects: AnalyticsData['projects'] = {};
    state.projects.forEach(project => {
      const projectTasks = state.tasks.filter(task => task.projectId === project.id);
      const projectCompleted = projectTasks.filter(task => task.completed).length;
      
      projects[project.id] = {
        name: project.name,
        color: project.color,
        total: projectTasks.length,
        completed: projectCompleted,
        completionRate: projectTasks.length > 0 
          ? Math.round((projectCompleted / projectTasks.length) * 100) 
          : 0,
      };
    });

    // Priority analysis
    const priorities = {
      high: {
        total: state.tasks.filter(task => task.priority === 'high').length,
        completed: state.tasks.filter(task => task.priority === 'high' && task.completed).length,
      },
      medium: {
        total: state.tasks.filter(task => task.priority === 'medium').length,
        completed: state.tasks.filter(task => task.priority === 'medium' && task.completed).length,
      },
      low: {
        total: state.tasks.filter(task => task.priority === 'low').length,
        completed: state.tasks.filter(task => task.priority === 'low' && task.completed).length,
      },
    };

    // Time analysis
    const completedTasksWithDates = state.tasks.filter(task => 
      task.completed && task.createdAt && task.updatedAt
    );

    const completionTimes = completedTasksWithDates.map(task => {
      const created = new Date(task.createdAt);
      const completed = new Date(task.updatedAt);
      return Math.floor((completed.getTime() - created.getTime()) / (24 * 60 * 60 * 1000));
    });

    const averageCompletionDays = completionTimes.length > 0 
      ? Math.round(completionTimes.reduce((sum, days) => sum + days, 0) / completionTimes.length)
      : 0;

    const activeTasksForAnalysis = state.tasks.filter(task => !task.completed);
    const oldestActiveTask = activeTasksForAnalysis.length > 0
      ? Math.floor((now.getTime() - Math.min(...activeTasksForAnalysis.map(task => task.createdAt.getTime()))) / (24 * 60 * 60 * 1000))
      : 0;

    // Recent activity (last 7 days)
    const recentActivity = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const created = state.tasks.filter(task => 
        task.createdAt >= date && task.createdAt < nextDate
      ).length;

      const completed = state.tasks.filter(task => 
        task.completed && task.updatedAt >= date && task.updatedAt < nextDate
      ).length;

      recentActivity.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        created,
        completed,
      });
    }

    // TODAY ANALYTICS
    const todayTasks = state.tasks.filter(task =>
      task.dueDate &&
      task.dueDate >= today &&
      task.dueDate < tomorrow
    );
    const todayOverdueTasks = state.tasks.filter(task =>
      !task.completed &&
      task.dueDate &&
      task.dueDate < today
    );
    const activeTodayTasks = todayTasks.filter(task => !task.completed);

    const todayAnalytics = {
      totalTasks: todayTasks.length,
      completedTasks: todayTasks.filter(task => task.completed).length,
      overdueTasks: todayOverdueTasks.length,
      highPriorityTasks: activeTodayTasks.filter(task => task.priority === 'high').length,
      mediumPriorityTasks: activeTodayTasks.filter(task => task.priority === 'medium').length,
      lowPriorityTasks: activeTodayTasks.filter(task => task.priority === 'low').length,
      completionRate: todayTasks.length > 0 ? Math.round((todayTasks.filter(task => task.completed).length / todayTasks.length) * 100) : 0,
    };

    // INBOX ANALYTICS
    const inboxTasks = state.tasks.filter(task => !task.projectId && !task.completed);
    const recentTasks = inboxTasks.filter(task =>
      task.createdAt >= new Date(now.getTime() - (24 * 60 * 60 * 1000))
    ).length;
    const urgentTasks = inboxTasks.filter(task =>
      task.priority === 'high' ||
      (task.dueDate && task.dueDate <= new Date(now.getTime() + (24 * 60 * 60 * 1000)))
    ).length;
    const oldestTask = inboxTasks.reduce((oldest, task) =>
      !oldest || task.createdAt < oldest.createdAt ? task : oldest
    , null as any);
    const oldestTaskDays = oldestTask
      ? Math.floor((now.getTime() - oldestTask.createdAt.getTime()) / (24 * 60 * 60 * 1000))
      : 0;

    const inboxAnalytics = {
      totalUnassigned: inboxTasks.length,
      recentTasks,
      urgentTasks,
      oldestTaskDays,
    };

    // ALL TASKS ANALYTICS
    const allActiveTasks = state.tasks.filter(task => !task.completed);
    const allTasksAnalytics = {
      totalActive: allActiveTasks.length,
      highPriority: allActiveTasks.filter(task => task.priority === 'high').length,
      mediumPriority: allActiveTasks.filter(task => task.priority === 'medium').length,
      lowPriority: allActiveTasks.filter(task => task.priority === 'low').length,
      overdue: allActiveTasks.filter(task =>
        task.dueDate && task.dueDate < today
      ).length,
      dueToday: allActiveTasks.filter(task =>
        task.dueDate && task.dueDate >= today && task.dueDate < tomorrow
      ).length,
      dueTomorrow: allActiveTasks.filter(task =>
        task.dueDate && task.dueDate >= tomorrow && task.dueDate < dayAfterTomorrow
      ).length,
      noDueDate: allActiveTasks.filter(task => !task.dueDate).length,
    };

    // COMPLETED ANALYTICS
    const completedTasksList = state.tasks.filter(task => task.completed);
    const completedToday = completedTasksList.filter(task =>
      task.updatedAt >= today
    ).length;
    const completedThisWeek = completedTasksList.filter(task =>
      task.updatedAt >= weekAgo
    ).length;
    const completedThisMonth = completedTasksList.filter(task =>
      task.updatedAt >= monthAgo
    ).length;

    const completedAnalytics = {
      totalCompleted: completedTasksList.length,
      completedToday,
      completedThisWeek,
      completedThisMonth,
      averageCompletionTime: averageCompletionDays,
      priorityBreakdown: {
        high: completedTasksList.filter(task => task.priority === 'high').length,
        medium: completedTasksList.filter(task => task.priority === 'medium').length,
        low: completedTasksList.filter(task => task.priority === 'low').length,
      },
    };

    return {
      overview: {
        totalTasks,
        completedTasks,
        activeTasks,
        completionRate,
        overdueTasks,
      },
      productivity: {
        todayCompleted,
        weekCompleted,
        monthCompleted,
        averageDaily,
        streak,
      },
      projects,
      priorities,
      timeAnalysis: {
        averageCompletionDays,
        oldestActiveTask,
        recentActivity,
      },
      todayAnalytics,
      inboxAnalytics,
      allTasksAnalytics,
      completedAnalytics,
    };
  }, [state.tasks, state.projects]);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 900);
    return () => clearTimeout(timer);
  }, []);

  // Show loading state
  if (isLoading) {
    return <PageLoading message="Loading analytics..." />;
  }

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
            <p className="text-muted-foreground">
              Track your productivity and task completion patterns
            </p>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                  <p className="text-2xl font-bold text-foreground">{analytics.overview.totalTasks}</p>
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
                  <p className="text-2xl font-bold text-green-600">{analytics.overview.completedTasks}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-blue-600">{analytics.overview.activeTasks}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                  <p className="text-2xl font-bold text-primary">{analytics.overview.completionRate}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{analytics.overview.overdueTasks}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600/60" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics Tabs */}
        <Tabs defaultValue="productivity" className="space-y-4">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="productivity">Productivity</TabsTrigger>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="inbox">Inbox</TabsTrigger>
            <TabsTrigger value="all-tasks">All Tasks</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="productivity" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Today</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {analytics.productivity.todayCompleted}
                  </div>
                  <p className="text-xs text-muted-foreground">tasks completed</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">This Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {analytics.productivity.weekCompleted}
                  </div>
                  <p className="text-xs text-muted-foreground">tasks completed</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {analytics.productivity.averageDaily}
                  </div>
                  <p className="text-xs text-muted-foreground">tasks per day</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Streak</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {analytics.productivity.streak}
                  </div>
                  <p className="text-xs text-muted-foreground">consecutive days</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.timeAnalysis.recentActivity.map((day, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-16 text-sm font-medium">{day.date}</div>
                      <div className="flex-1 flex gap-2">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <span>Created: {day.created}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span>Completed: {day.completed}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="today" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                      <p className="text-2xl font-bold text-foreground">{analytics.todayAnalytics.totalTasks}</p>
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
                      <p className="text-2xl font-bold text-green-600">{analytics.todayAnalytics.completedTasks}</p>
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
                      <p className="text-2xl font-bold text-red-600">{analytics.todayAnalytics.overdueTasks}</p>
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
                      <p className="text-2xl font-bold text-primary">{analytics.todayAnalytics.completionRate}%</p>
                    </div>
                    <Clock className="w-8 h-8 text-primary/60" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Priority Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{analytics.todayAnalytics.highPriorityTasks}</div>
                    <div className="text-sm text-muted-foreground">High Priority</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{analytics.todayAnalytics.mediumPriorityTasks}</div>
                    <div className="text-sm text-muted-foreground">Medium Priority</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{analytics.todayAnalytics.lowPriorityTasks}</div>
                    <div className="text-sm text-muted-foreground">Low Priority</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inbox" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Unassigned</p>
                      <p className="text-2xl font-bold text-foreground">{analytics.inboxAnalytics.totalUnassigned}</p>
                    </div>
                    <Package className="w-8 h-8 text-primary/60" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Recent</p>
                      <p className="text-2xl font-bold text-blue-600">{analytics.inboxAnalytics.recentTasks}</p>
                    </div>
                    <ArrowRight className="w-8 h-8 text-blue-600/60" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Urgent</p>
                      <p className="text-2xl font-bold text-red-600">{analytics.inboxAnalytics.urgentTasks}</p>
                    </div>
                    <Filter className="w-8 h-8 text-red-600/60" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Oldest</p>
                      <p className="text-2xl font-bold text-orange-600">{analytics.inboxAnalytics.oldestTaskDays}d</p>
                    </div>
                    <CheckSquare className="w-8 h-8 text-orange-600/60" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="all-tasks" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Active</p>
                      <p className="text-2xl font-bold text-foreground">{analytics.allTasksAnalytics.totalActive}</p>
                    </div>
                    <Target className="w-8 h-8 text-primary/60" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                      <p className="text-2xl font-bold text-red-600">{analytics.allTasksAnalytics.overdue}</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-red-600/60" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Due Today</p>
                      <p className="text-2xl font-bold text-blue-600">{analytics.allTasksAnalytics.dueToday}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-blue-600/60" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">No Due Date</p>
                      <p className="text-2xl font-bold text-gray-600">{analytics.allTasksAnalytics.noDueDate}</p>
                    </div>
                    <Clock className="w-8 h-8 text-gray-600/60" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Priority Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">High Priority</span>
                      <span className="font-medium text-red-600">{analytics.allTasksAnalytics.highPriority}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Medium Priority</span>
                      <span className="font-medium text-yellow-600">{analytics.allTasksAnalytics.mediumPriority}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Low Priority</span>
                      <span className="font-medium text-green-600">{analytics.allTasksAnalytics.lowPriority}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Due Date Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Due Tomorrow</span>
                      <span className="font-medium text-blue-600">{analytics.allTasksAnalytics.dueTomorrow}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Due Today</span>
                      <span className="font-medium text-orange-600">{analytics.allTasksAnalytics.dueToday}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Overdue</span>
                      <span className="font-medium text-red-600">{analytics.allTasksAnalytics.overdue}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold text-green-600">{analytics.completedAnalytics.totalCompleted}</p>
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
                      <p className="text-2xl font-bold text-blue-600">{analytics.completedAnalytics.completedToday}</p>
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
                      <p className="text-2xl font-bold text-purple-600">{analytics.completedAnalytics.completedThisWeek}</p>
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
                      <p className="text-2xl font-bold text-orange-600">{analytics.completedAnalytics.averageCompletionTime}</p>
                    </div>
                    <Filter className="w-8 h-8 text-orange-600/60" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Completed Tasks by Priority</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{analytics.completedAnalytics.priorityBreakdown.high}</div>
                    <div className="text-sm text-muted-foreground">High Priority</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{analytics.completedAnalytics.priorityBreakdown.medium}</div>
                    <div className="text-sm text-muted-foreground">Medium Priority</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{analytics.completedAnalytics.priorityBreakdown.low}</div>
                    <div className="text-sm text-muted-foreground">Low Priority</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-4">
            <div className="grid gap-4">
              {Object.values(analytics.projects).map((project) => (
                <Card key={project.name}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: project.color }}
                        />
                        <span className="font-medium">{project.name}</span>
                      </div>
                      <Badge variant="secondary">
                        {project.completed}/{project.total}
                      </Badge>
                    </div>
                    <Progress value={project.completionRate} className="h-2" />
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>{project.completionRate}% complete</span>
                      <span>{project.total - project.completed} remaining</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Time Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Average completion time</span>
                    <span className="font-medium">{analytics.timeAnalysis.averageCompletionDays} days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Oldest active task</span>
                    <span className="font-medium">{analytics.timeAnalysis.oldestActiveTask} days old</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Overall Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {analytics.overview.completionRate}%
                    </div>
                    <Progress value={analytics.overview.completionRate} className="h-3 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {analytics.overview.completedTasks} of {analytics.overview.totalTasks} tasks completed
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
