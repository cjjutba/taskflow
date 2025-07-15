import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Folder, BarChart3, Calendar, CheckCircle, Clock, AlertTriangle, Settings } from 'lucide-react';
import { useTask } from '../contexts/TaskContext';
import TaskList from '../components/TaskList';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { PageLoading, SectionLoading } from '../components/ui/loading-spinner';
import { useUrlFilters } from '../hooks/useUrlFilters';

interface ProjectStats {
  totalTasks: number;
  completedTasks: number;
  activeTasks: number;
  completionRate: number;
  overdueTasks: number;
  dueTodayTasks: number;
  highPriorityTasks: number;
  mediumPriorityTasks: number;
  lowPriorityTasks: number;
  averageCompletionDays: number;
  recentActivity: {
    created: number;
    completed: number;
  };
}

export default function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { state } = useTask();
  const { filters } = useUrlFilters();
  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const { project, projectTasks, stats, filteredTasks } = useMemo(() => {
    // Find the project
    const project = state.projects.find(p => p.id === projectId);

    if (!project) {
      return { project: null, projectTasks: [], stats: null, filteredTasks: [] };
    }

    // Get all tasks for this project
    let projectTasks = state.tasks.filter(task => task.projectId === projectId);

    // Apply URL filters
    let filteredTasks = projectTasks;

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
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

    // Calculate project statistics
    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter(task => task.completed).length;
    const activeTasks = totalTasks - completedTasks;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const activeProjectTasks = projectTasks.filter(task => !task.completed);
    const overdueTasks = activeProjectTasks.filter(task => 
      task.dueDate && task.dueDate < today
    ).length;

    const dueTodayTasks = activeProjectTasks.filter(task => 
      task.dueDate && task.dueDate >= today && task.dueDate < tomorrow
    ).length;

    const highPriorityTasks = activeProjectTasks.filter(task => task.priority === 'high').length;
    const mediumPriorityTasks = activeProjectTasks.filter(task => task.priority === 'medium').length;
    const lowPriorityTasks = activeProjectTasks.filter(task => task.priority === 'low').length;

    // Calculate average completion time
    const completedProjectTasks = projectTasks.filter(task => 
      task.completed && task.createdAt && task.updatedAt
    );

    const completionTimes = completedProjectTasks.map(task => {
      const created = new Date(task.createdAt);
      const completed = new Date(task.updatedAt);
      return Math.floor((completed.getTime() - created.getTime()) / (24 * 60 * 60 * 1000));
    });

    const averageCompletionDays = completionTimes.length > 0 
      ? Math.round(completionTimes.reduce((sum, days) => sum + days, 0) / completionTimes.length)
      : 0;

    // Recent activity (last 7 days)
    const recentCreated = projectTasks.filter(task => 
      task.createdAt >= weekAgo
    ).length;

    const recentCompleted = projectTasks.filter(task => 
      task.completed && task.updatedAt >= weekAgo
    ).length;

    const stats: ProjectStats = {
      totalTasks,
      completedTasks,
      activeTasks,
      completionRate,
      overdueTasks,
      dueTodayTasks,
      highPriorityTasks,
      mediumPriorityTasks,
      lowPriorityTasks,
      averageCompletionDays,
      recentActivity: {
        created: recentCreated,
        completed: recentCompleted,
      },
    };

    return { project, projectTasks, stats, filteredTasks };
  }, [projectId, state.projects, state.tasks, filters]);

  // Show loading state
  if (isLoading) {
    return <PageLoading message="Loading project..." />;
  }

  // Handle project not found
  if (!project) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Folder className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Project Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The project you're looking for doesn't exist or has been deleted.
          </p>
          <Button onClick={() => navigate('/')}>
            Go to Today
          </Button>
        </div>
      </div>
    );
  }

  const activeTasks = filteredTasks.filter(task => !task.completed);
  const completedTasks = filteredTasks.filter(task => task.completed);

  return (
    <div className="h-full flex flex-col">
      {/* Project Header */}
      <div className="flex-shrink-0 p-6 border-b border-border">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="w-6 h-6 rounded-full flex-shrink-0" 
              style={{ backgroundColor: project.color }}
            />
            <h1 className="text-2xl font-semibold text-foreground">{project.name}</h1>
            <Badge variant="secondary" className="ml-2">
              {stats!.activeTasks} active
            </Badge>
            <Button variant="ghost" size="sm" className="ml-auto">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-muted-foreground">
            Project overview and task management
          </p>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                  <p className="text-2xl font-bold text-foreground">{stats!.totalTasks}</p>
                </div>
                <Folder className="w-8 h-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats!.completedTasks}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Due Today</p>
                  <p className="text-2xl font-bold text-blue-600">{stats!.dueTodayTasks}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{stats!.overdueTasks}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600/60" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Project Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Overall Completion</span>
                    <span className="text-sm text-muted-foreground">
                      {stats!.completedTasks} of {stats!.totalTasks}
                    </span>
                  </div>
                  <Progress value={stats!.completionRate} className="h-2" />
                  <div className="text-right text-sm text-muted-foreground mt-1">
                    {stats!.completionRate}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Priority Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm">High Priority</span>
                  </div>
                  <span className="font-medium">{stats!.highPriorityTasks}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-sm">Medium Priority</span>
                  </div>
                  <span className="font-medium">{stats!.mediumPriorityTasks}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm">Low Priority</span>
                  </div>
                  <span className="font-medium">{stats!.lowPriorityTasks}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Completion</p>
                  <p className="font-medium">{stats!.averageCompletionDays} days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Recent Activity</p>
                  <p className="font-medium">
                    +{stats!.recentActivity.created} created, {stats!.recentActivity.completed} completed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="font-medium">{stats!.completionRate}% completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Project Tasks */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="active" className="h-full flex flex-col">
          <div className="flex-shrink-0 px-6 pt-4">
            <TabsList>
              <TabsTrigger value="active">
                Active Tasks ({stats!.activeTasks})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({stats!.completedTasks})
              </TabsTrigger>
              <TabsTrigger value="all">
                All Tasks ({stats!.totalTasks})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="active" className="flex-1 overflow-hidden mt-0">
            <TaskList 
              title={`${project.name} - Active Tasks`}
              tasks={activeTasks}
              showAddButton={true}
            />
          </TabsContent>

          <TabsContent value="completed" className="flex-1 overflow-hidden mt-0">
            <TaskList 
              title={`${project.name} - Completed Tasks`}
              tasks={completedTasks}
              showAddButton={false}
            />
          </TabsContent>

          <TabsContent value="all" className="flex-1 overflow-hidden mt-0">
            <TaskList
              title={`${project.name} - All Tasks`}
              tasks={filteredTasks}
              showAddButton={true}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
