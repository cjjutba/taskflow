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
import { useTaskHighlight } from '../hooks/useTaskHighlight';
import { UrlService } from '../services/urlService';

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
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useTask();
  const { filters } = useUrlFilters();
  const { highlightedTaskId, scrollToTask, showTaskNotFound } = useTaskHighlight();
  const [isLoading, setIsLoading] = useState(true);
  const urlService = new UrlService();

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const { project, projectTasks, stats, filteredTasks } = useMemo(() => {
    // Find the project by slug
    const project = slug ? urlService.findProjectBySlug(slug, state.projects) : null;

    if (!project) {
      return { project: null, projectTasks: [], stats: null, filteredTasks: [] };
    }

    // Get all tasks for this project
    let projectTasks = state.tasks.filter(task => task.projectId === project.id);

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
  }, [slug, state.projects, state.tasks, filters, urlService]);

  // Validate highlighted task belongs to this page (must be before any early returns)
  useEffect(() => {
    if (highlightedTaskId && project && projectTasks.length > 0) {
      const taskExists = projectTasks.find(task => task.id === highlightedTaskId);

      if (taskExists) {
        // Task belongs to this page, scroll to it
        scrollToTask(highlightedTaskId);
      } else {
        // Task doesn't belong to this page
        showTaskNotFound(highlightedTaskId, 'Project');
      }
    }
  }, [highlightedTaskId, project, projectTasks, scrollToTask, showTaskNotFound]);

  // Set activeView to project ID when project is found
  useEffect(() => {
    if (project) {
      dispatch({
        type: 'SET_UI',
        payload: { key: 'activeView', value: project.id }
      });
    }
  }, [project, dispatch]);

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
