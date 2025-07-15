import Fuse from 'fuse.js';
import { Task, Project } from '../types/task';
import { 
  SearchResult, 
  SearchFilters, 
  SearchOptions, 
  SearchQuery,
  ParsedSearchQuery,
  SearchOperator 
} from '../types/search';

export class SearchService {
  private taskFuse: Fuse<Task> | null = null;
  private projectFuse: Fuse<Project> | null = null;

  private readonly taskFuseOptions: Fuse.IFuseOptions<Task> = {
    keys: [
      { name: 'title', weight: 0.7 },
      { name: 'description', weight: 0.3 },
      { name: 'tags', weight: 0.2 },
    ],
    threshold: 0.4,
    includeScore: true,
    includeMatches: true,
    minMatchCharLength: 2,
  };

  private readonly projectFuseOptions: Fuse.IFuseOptions<Project> = {
    keys: [
      { name: 'name', weight: 0.8 },
      { name: 'description', weight: 0.2 },
    ],
    threshold: 0.3,
    includeScore: true,
    includeMatches: true,
    minMatchCharLength: 2,
  };

  // Initialize search indexes
  public initializeIndexes(tasks: Task[], projects: Project[]): void {
    this.taskFuse = new Fuse(tasks, this.taskFuseOptions);
    this.projectFuse = new Fuse(projects, this.projectFuseOptions);
  }

  // Main search function
  public search(query: SearchQuery): SearchResult[] {
    if (!query.text.trim() && Object.keys(query.filters).length === 0) {
      return [];
    }

    const parsedQuery = this.parseQuery(query.text);
    const combinedFilters = { ...query.filters, ...parsedQuery.filters };

    let results: SearchResult[] = [];

    // Search tasks
    if (this.taskFuse) {
      const taskResults = this.searchTasks(parsedQuery.text, combinedFilters, query.options);
      results.push(...taskResults);
    }

    // Search projects
    if (this.projectFuse) {
      const projectResults = this.searchProjects(parsedQuery.text, combinedFilters, query.options);
      results.push(...projectResults);
    }

    // Add quick actions if query looks like a task creation
    if (query.text.trim() && results.length < 3) {
      const quickActions = this.generateQuickActions(query.text);
      results.push(...quickActions);
    }

    // Sort and limit results
    results = this.sortResults(results, query.options.sortBy || 'relevance', query.options.sortOrder || 'desc');
    
    if (query.options.maxResults) {
      results = results.slice(0, query.options.maxResults);
    }

    return results;
  }

  // Parse search query for operators and filters
  private parseQuery(query: string): ParsedSearchQuery {
    const operators: SearchOperator[] = [];
    const filters: SearchFilters = {};
    let cleanText = query;

    // Parse filter operators (priority:high, project:"My Project", etc.)
    const filterRegex = /(\w+):(["\']?)([^"\s]+)\2/g;
    let match;

    while ((match = filterRegex.exec(query)) !== null) {
      const [fullMatch, key, , value] = match;
      cleanText = cleanText.replace(fullMatch, '').trim();

      switch (key.toLowerCase()) {
        case 'priority':
          if (['high', 'medium', 'low'].includes(value.toLowerCase())) {
            filters.priority = value.toLowerCase() as 'high' | 'medium' | 'low';
          }
          break;
        case 'status':
          if (['completed', 'pending', 'overdue'].includes(value.toLowerCase())) {
            filters.status = value.toLowerCase() as 'completed' | 'pending' | 'overdue';
          }
          break;
        case 'project':
          filters.project = value;
          break;
        case 'due':
          if (['today', 'tomorrow', 'this-week', 'next-week', 'overdue'].includes(value.toLowerCase())) {
            filters.dueDate = value.toLowerCase() as any;
          }
          break;
      }

      operators.push({
        type: 'filter',
        key,
        value,
        operator: 'equals',
      });
    }

    return {
      text: cleanText.trim(),
      operators,
      filters,
    };
  }

  // Search tasks with fuzzy matching
  private searchTasks(query: string, filters: SearchFilters, options: SearchOptions): SearchResult[] {
    if (!this.taskFuse) return [];

    let tasks: Task[] = [];

    if (query.trim()) {
      const fuseResults = this.taskFuse.search(query);
      tasks = fuseResults.map(result => ({
        ...result.item,
        _fuseScore: result.score || 0,
        _fuseMatches: result.matches || [],
      }));
    } else {
      // If no query, get all tasks for filtering
      tasks = this.taskFuse.getIndex().docs as Task[];
    }

    // Apply filters
    tasks = this.applyTaskFilters(tasks, filters, options);

    // Convert to SearchResult format
    return tasks.map(task => this.taskToSearchResult(task));
  }

  // Search projects with fuzzy matching
  private searchProjects(query: string, filters: SearchFilters, options: SearchOptions): SearchResult[] {
    if (!this.projectFuse) return [];

    let projects: Project[] = [];

    if (query.trim()) {
      const fuseResults = this.projectFuse.search(query);
      projects = fuseResults.map(result => ({
        ...result.item,
        _fuseScore: result.score || 0,
        _fuseMatches: result.matches || [],
      }));
    } else {
      projects = this.projectFuse.getIndex().docs as Project[];
    }

    // Apply project filters
    if (filters.project) {
      projects = projects.filter(project => 
        project.name.toLowerCase().includes(filters.project!.toLowerCase())
      );
    }

    return projects.map(project => this.projectToSearchResult(project));
  }

  // Apply filters to tasks
  private applyTaskFilters(tasks: Task[], filters: SearchFilters, options: SearchOptions): Task[] {
    let filteredTasks = [...tasks];

    // Priority filter
    if (filters.priority) {
      filteredTasks = filteredTasks.filter(task => task.priority === filters.priority);
    }

    // Status filter
    if (filters.status) {
      const now = new Date();
      switch (filters.status) {
        case 'completed':
          filteredTasks = filteredTasks.filter(task => task.completed);
          break;
        case 'pending':
          filteredTasks = filteredTasks.filter(task => !task.completed);
          break;
        case 'overdue':
          filteredTasks = filteredTasks.filter(task => 
            !task.completed && task.dueDate && task.dueDate < now
          );
          break;
      }
    }

    // Project filter
    if (filters.project) {
      filteredTasks = filteredTasks.filter(task => task.projectId === filters.project);
    }

    // Due date filter
    if (filters.dueDate) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      switch (filters.dueDate) {
        case 'today':
          filteredTasks = filteredTasks.filter(task => 
            task.dueDate && task.dueDate >= today && task.dueDate < tomorrow
          );
          break;
        case 'tomorrow':
          const dayAfterTomorrow = new Date(tomorrow);
          dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
          filteredTasks = filteredTasks.filter(task => 
            task.dueDate && task.dueDate >= tomorrow && task.dueDate < dayAfterTomorrow
          );
          break;
        case 'overdue':
          filteredTasks = filteredTasks.filter(task => 
            !task.completed && task.dueDate && task.dueDate < today
          );
          break;
      }
    }

    // Date range filter
    if (filters.dateRange) {
      filteredTasks = filteredTasks.filter(task => {
        if (!task.dueDate) return false;
        return task.dueDate >= filters.dateRange!.from && task.dueDate <= filters.dateRange!.to;
      });
    }

    // Include/exclude completed tasks
    if (options.includeCompleted === false) {
      filteredTasks = filteredTasks.filter(task => !task.completed);
    }

    return filteredTasks;
  }

  // Convert task to search result
  private taskToSearchResult(task: any): SearchResult {
    const fuseScore = task._fuseScore || 0;
    const matches = task._fuseMatches || [];

    // Calculate relevance score based on multiple factors
    let relevance = 1 - fuseScore; // Fuse score is lower = better, so invert it
    
    // Boost score for high priority tasks
    if (task.priority === 'high') relevance += 0.2;
    else if (task.priority === 'medium') relevance += 0.1;

    // Boost score for recent tasks
    const daysSinceCreated = (Date.now() - task.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreated < 7) relevance += 0.1;

    // Boost score for tasks due soon
    if (task.dueDate) {
      const daysUntilDue = (task.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      if (daysUntilDue >= 0 && daysUntilDue <= 3) relevance += 0.15;
    }

    // Generate highlights from Fuse matches
    const highlights: any = {};
    matches.forEach((match: any) => {
      if (match.key === 'title' || match.key === 'description') {
        highlights[match.key] = this.generateHighlight(match.value, match.indices);
      }
    });

    return {
      id: task.id,
      type: 'task',
      title: task.title,
      description: task.description,
      score: fuseScore,
      relevance: Math.min(relevance, 1), // Cap at 1
      context: {
        projectName: task.projectId ? 'Project Name' : undefined, // TODO: Get actual project name
      },
      data: task,
      highlights,
    };
  }

  // Convert project to search result
  private projectToSearchResult(project: any): SearchResult {
    const fuseScore = project._fuseScore || 0;
    const matches = project._fuseMatches || [];

    const highlights: any = {};
    matches.forEach((match: any) => {
      if (match.key === 'name' || match.key === 'description') {
        highlights[match.key] = this.generateHighlight(match.value, match.indices);
      }
    });

    return {
      id: project.id,
      type: 'project',
      title: project.name,
      description: project.description,
      score: fuseScore,
      relevance: 1 - fuseScore,
      data: project,
      highlights,
    };
  }

  // Generate quick action results
  private generateQuickActions(query: string): SearchResult[] {
    const actions: SearchResult[] = [];

    if (query.trim().length > 2) {
      actions.push({
        id: 'create-task',
        type: 'action',
        title: `Create task: "${query}"`,
        description: 'Create a new task with this title',
        score: 0,
        relevance: 0.5,
        data: {
          id: 'create-task',
          label: `Create task: "${query}"`,
          description: 'Create a new task with this title',
          action: () => {
            // TODO: Implement task creation
            console.log('Creating task:', query);
          },
        },
      });
    }

    return actions;
  }

  // Sort search results
  private sortResults(results: SearchResult[], sortBy: string, sortOrder: 'asc' | 'desc'): SearchResult[] {
    return results.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'relevance':
          comparison = b.relevance - a.relevance;
          break;
        case 'alphabetical':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'date':
          const aDate = (a.data as Task).createdAt || new Date(0);
          const bDate = (b.data as Task).createdAt || new Date(0);
          comparison = bDate.getTime() - aDate.getTime();
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          const aPriority = priorityOrder[(a.data as Task).priority] || 0;
          const bPriority = priorityOrder[(b.data as Task).priority] || 0;
          comparison = bPriority - aPriority;
          break;
        default:
          comparison = b.relevance - a.relevance;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  // Generate text highlights for search matches
  private generateHighlight(text: string, indices: number[][]): string {
    if (!indices || indices.length === 0) return text;

    let highlighted = '';
    let lastIndex = 0;

    indices.forEach(([start, end]) => {
      highlighted += text.slice(lastIndex, start);
      highlighted += `<mark>${text.slice(start, end + 1)}</mark>`;
      lastIndex = end + 1;
    });

    highlighted += text.slice(lastIndex);
    return highlighted;
  }

  // Get search suggestions based on recent searches and common patterns
  public getSuggestions(query: string, recentSearches: string[]): string[] {
    const suggestions: string[] = [];

    // Add matching recent searches
    const matchingRecent = recentSearches.filter(search => 
      search.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 3);
    suggestions.push(...matchingRecent);

    // Add common search patterns
    const commonPatterns = [
      'priority:high',
      'status:overdue',
      'due:today',
      'due:this-week',
      'status:completed',
    ];

    const matchingPatterns = commonPatterns.filter(pattern =>
      pattern.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 2);
    suggestions.push(...matchingPatterns);

    return [...new Set(suggestions)].slice(0, 5);
  }
}

// Export singleton instance
export const searchService = new SearchService();
