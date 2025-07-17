import { NavigateFunction } from 'react-router-dom';
import { SearchResult } from './searchService';
import { Task, Project, Section } from '../contexts/TaskContext';
import { urlService } from './urlService';

export interface NavigationContext {
  navigate: NavigateFunction;
  dispatch: React.Dispatch<any>; // TaskContext dispatch
}

export class NavigationService {
  private context: NavigationContext | null = null;

  // Set navigation context (called from a component with access to navigate and dispatch)
  setContext(context: NavigationContext) {
    this.context = context;
  }

  // Navigate to a search result using URL-based navigation
  navigateToResult(result: SearchResult) {
    if (!this.context) {
      console.warn('Navigation context not set');
      return;
    }

    const { navigate } = this.context;
    const targetUrl = urlService.getSearchResultUrl(result);

    // Use React Router navigation
    navigate(targetUrl);
  }

  // Legacy method - kept for backward compatibility
  // All navigation now handled by URL service
  navigateToTask(task: Task) {
    const targetUrl = urlService.getTaskUrl(task);
    if (this.context) {
      this.context.navigate(targetUrl);
    }
  }

  navigateToProject(project: Project) {
    const targetUrl = urlService.getProjectUrl(project);
    if (this.context) {
      this.context.navigate(targetUrl);
    }
  }

  // Utility methods for URL generation (delegates to URL service)
  getTaskUrl(task: Task): string {
    return urlService.getTaskUrl(task);
  }

  getProjectUrl(project: Project): string {
    return urlService.getProjectUrl(project);
  }

  getSearchResultUrl(result: SearchResult): string {
    return urlService.getSearchResultUrl(result);
  }

  // Navigate to a specific URL
  navigateToUrl(url: string) {
    if (this.context) {
      this.context.navigate(url);
    }
  }

  // Get the appropriate page route for a search result
  getResultRoute(result: SearchResult): string {
    return urlService.getSearchResultUrl(result);
  }

  // Get context description for a result
  getResultContext(result: SearchResult): string {
    switch (result.type) {
      case 'task':
        const task = result.data as Task;
        let context = result.context || 'All Tasks';
        
        if (result.projectName) {
          context += ` • ${result.projectName}`;
        }
        
        if (result.sectionName) {
          context += ` • ${result.sectionName}`;
        }
        
        return context;
      
      case 'project':
        return result.context || 'Projects';
      
      case 'section':
        return result.context || 'Board View';
      
      default:
        return '';
    }
  }

  // Get status indicator for a result
  getResultStatus(result: SearchResult): {
    color: string;
    label: string;
  } {
    switch (result.type) {
      case 'task':
        const task = result.data as Task;
        if (task.completed) {
          return { color: 'text-green-600', label: 'Completed' };
        }
        if (result.status === 'overdue') {
          return { color: 'text-red-600', label: 'Overdue' };
        }
        if (result.priority === 'high') {
          return { color: 'text-red-500', label: 'High Priority' };
        }
        if (result.priority === 'medium') {
          return { color: 'text-yellow-500', label: 'Medium Priority' };
        }
        return { color: 'text-blue-500', label: 'Active' };
      
      case 'project':
        const project = result.data as Project;
        return { 
          color: 'text-green-500', 
          label: `${project.taskCount} tasks` 
        };
      
      case 'section':
        return { color: 'text-purple-500', label: 'Section' };
      
      default:
        return { color: 'text-gray-500', label: '' };
    }
  }

  // Get icon for result type
  getResultIcon(result: SearchResult): string {
    switch (result.type) {
      case 'task':
        const task = result.data as Task;
        if (task.completed) return '✅';
        if (result.status === 'overdue') return '⚠️';
        if (result.priority === 'high') return '🔴';
        return '📋';
      
      case 'project':
        return '📁';
      
      case 'section':
        return '📑';
      
      default:
        return '📄';
    }
  }
}

// Singleton instance
export const navigationService = new NavigationService();
