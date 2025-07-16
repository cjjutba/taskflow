import { Task, Project, Section } from '../contexts/TaskContext';
import { SearchResult } from './searchService';

export class UrlService {

  /**
   * Generate a URL slug from a project name
   */
  private generateProjectSlug(projectName: string): string {
    return projectName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }

  /**
   * Find project by slug
   */
  findProjectBySlug(slug: string, projects: Project[]): Project | null {
    return projects.find(project =>
      this.generateProjectSlug(project.name) === slug
    ) || null;
  }

  /**
   * Generate a URL for a specific task that navigates to the correct page
   * and highlights the task
   */
  getTaskUrl(task: Task): string {
    const basePage = this.getTaskPageUrl(task);
    return `${basePage}?task=${task.id}`;
  }

  /**
   * Get the base page URL where a task should appear
   * Uses the same logic as the navigation service
   */
  getTaskPageUrl(task: Task): string {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Priority-based page determination (same as navigation logic)
    if (task.completed) {
      return '/completed';
    }
    if (!task.projectId) {
      return '/inbox';
    }
    if (task.dueDate && task.dueDate <= today) {
      return '/';
    }
    if (task.projectId) {
      return `/project/${task.projectId}`;
    }
    return '/all-tasks';
  }

  /**
   * Generate URL for a project using slug
   */
  getProjectUrl(project: Project): string {
    const slug = this.generateProjectSlug(project.name);
    return `/project/${slug}`;
  }

  /**
   * Generate URL for a project using project ID (fallback)
   */
  getProjectUrlById(projectId: string): string {
    return `/project/${projectId}`;
  }

  /**
   * Get the base page URL where a task should be displayed with project context
   */
  getTaskPageUrlWithProject(task: Task, projects: Project[]): string {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Priority-based page determination (same as navigation logic)
    if (task.completed) {
      return '/completed';
    }
    if (!task.projectId) {
      return '/inbox';
    }
    if (task.dueDate && task.dueDate <= today) {
      return '/';
    }
    if (task.projectId) {
      const project = projects.find(p => p.id === task.projectId);
      if (project) {
        return this.getProjectUrl(project);
      }
      // Fallback to project ID if project not found
      return `/project/${task.projectId}`;
    }
    return '/all-tasks';
  }

  /**
   * Generate a URL for a specific task with project context
   */
  getTaskUrlWithProject(task: Task, projects: Project[]): string {
    const basePage = this.getTaskPageUrlWithProject(task, projects);
    return `${basePage}?task=${task.id}`;
  }

  /**
   * Generate URL for a section (navigates to appropriate page in board view)
   */
  getSectionUrl(section: Section): string {
    const viewRoutes: { [key: string]: string } = {
      'today': '/',
      'inbox': '/inbox',
      'all-tasks': '/all-tasks',
      'completed': '/completed',
    };
    
    const basePage = viewRoutes[section.viewId] || '/all-tasks';
    return `${basePage}?view=board&section=${section.id}`;
  }

  /**
   * Generate URL for any search result
   */
  getSearchResultUrl(result: SearchResult): string {
    switch (result.type) {
      case 'task':
        return this.getTaskUrl(result.data as Task);
      case 'project':
        return this.getProjectUrl(result.data as Project);
      case 'section':
        return this.getSectionUrl(result.data as Section);
      default:
        return '/';
    }
  }

  /**
   * Generate URL for any search result with project context
   */
  getSearchResultUrlWithProject(result: SearchResult, projects: Project[]): string {
    switch (result.type) {
      case 'task':
        return this.getTaskUrlWithProject(result.data as Task, projects);
      case 'project':
        return this.getProjectUrl(result.data as Project);
      case 'section':
        return this.getSectionUrl(result.data as Section);
      default:
        return '/';
    }
  }

  /**
   * Generate a shareable URL for a task with additional context
   */
  getShareableTaskUrl(task: Task, includeSearch?: string): string {
    const baseUrl = this.getTaskUrl(task);
    if (includeSearch) {
      const url = new URL(baseUrl, window.location.origin);
      url.searchParams.set('search', includeSearch);
      return url.pathname + url.search;
    }
    return baseUrl;
  }

  /**
   * Parse task ID from current URL
   */
  getTaskIdFromUrl(): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('task');
  }

  /**
   * Check if current URL has a task parameter
   */
  hasTaskInUrl(): boolean {
    return this.getTaskIdFromUrl() !== null;
  }

  /**
   * Validate if a task ID is properly formatted
   */
  isValidTaskId(taskId: string): boolean {
    // Basic validation - adjust based on your task ID format
    return typeof taskId === 'string' && taskId.length > 0 && taskId.trim() !== '';
  }

  /**
   * Clean and sanitize task ID from URL
   */
  sanitizeTaskId(taskId: string): string | null {
    if (!taskId || typeof taskId !== 'string') return null;
    
    const cleaned = taskId.trim();
    return this.isValidTaskId(cleaned) ? cleaned : null;
  }

  /**
   * Generate breadcrumb-friendly URL structure
   */
  getTaskBreadcrumbData(task: Task): {
    pageName: string;
    pageUrl: string;
    taskName: string;
    taskUrl: string;
  } {
    const pageUrl = this.getTaskPageUrl(task);
    const taskUrl = this.getTaskUrl(task);
    
    let pageName = 'All Tasks';
    if (task.completed) pageName = 'Completed';
    else if (!task.projectId) pageName = 'Inbox';
    else if (task.dueDate && task.dueDate <= new Date()) pageName = 'Today';
    else if (task.projectId) pageName = 'Project'; // Will be enhanced with project name
    
    return {
      pageName,
      pageUrl,
      taskName: task.title,
      taskUrl,
    };
  }
}

// Singleton instance
export const urlService = new UrlService();
