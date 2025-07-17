import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Folder } from 'lucide-react';
import { useTask } from '../contexts/TaskContext';
import TaskList from '../components/TaskList';
import { Button } from '../components/ui/button';
import { PageLoading } from '../components/ui/loading-spinner';
import { useUrlFilters } from '../hooks/useUrlFilters';
import { useTaskHighlight } from '../hooks/useTaskHighlight';
import { UrlService } from '../services/urlService';



export default function ProjectPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useTask();
  const { filters } = useUrlFilters();
  const { highlightedTaskId, scrollToTask, showTaskNotFound } = useTaskHighlight();
  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const { project, filteredTasks } = useMemo(() => {
    const urlService = new UrlService();

    // Find the project by slug
    const project = slug ? urlService.findProjectBySlug(slug, state.projects) : null;

    if (!project) {
      return { project: null, filteredTasks: [] };
    }

    // Get all tasks for this project
    const projectTasks = state.tasks.filter(task => task.projectId === project.id);

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

    return { project, filteredTasks };
  }, [slug, state.projects, state.tasks, filters]);

  // Validate highlighted task belongs to this page (must be before any early returns)
  useEffect(() => {
    if (highlightedTaskId && project && filteredTasks.length > 0) {
      const taskExists = filteredTasks.find(task => task.id === highlightedTaskId);

      if (taskExists) {
        // Task belongs to this page, scroll to it
        scrollToTask(highlightedTaskId);
      } else {
        // Task doesn't belong to this page
        showTaskNotFound(highlightedTaskId, 'Project');
      }
    }
  }, [highlightedTaskId, project, filteredTasks, scrollToTask, showTaskNotFound]);

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

  return (
    <TaskList
      title={project.name}
      tasks={filteredTasks}
      showAddButton={true}
    />
  );
}
