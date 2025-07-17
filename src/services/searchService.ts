import Fuse from 'fuse.js';
import { Task, Project, Section } from '../contexts/TaskContext';

export interface SearchableItem {
  id: string;
  type: 'task' | 'project' | 'section';
  title: string;
  description?: string;
  context?: string; // Which page/section this belongs to
  projectName?: string;
  sectionName?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'completed' | 'active' | 'overdue';
  dueDate?: Date | null;
  data: Task | Project | Section;
}

export interface SearchResult extends SearchableItem {
  score?: number;
  matches?: Fuse.FuseResultMatch[];
}

export interface SearchOptions {
  limit?: number;
  includeScore?: boolean;
  threshold?: number; // 0.0 = perfect match, 1.0 = match anything
}

export class SearchService {
  private fuse: Fuse<SearchableItem>;
  private searchableItems: SearchableItem[] = [];
  private searchCache: Map<string, SearchResult[]> = new Map();
  private indexVersion: number = 0;
  private lastIndexUpdate: number = 0;

  constructor() {
    // Fuse.js configuration for fuzzy search
    const fuseOptions: Fuse.IFuseOptions<SearchableItem> = {
      keys: [
        { name: 'title', weight: 0.4 }, // Highest weight for title
        { name: 'description', weight: 0.3 },
        { name: 'projectName', weight: 0.2 },
        { name: 'sectionName', weight: 0.1 },
      ],
      threshold: 0.4, // 0.0 = perfect match, 1.0 = match anything
      distance: 100,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
      shouldSort: true,
    };

    this.fuse = new Fuse([], fuseOptions);
  }

  // Update the search index with current data
  updateIndex(tasks: Task[], projects: Project[], sections: Section[]) {
    const now = Date.now();

    // Skip update if data hasn't changed significantly (debounce)
    if (now - this.lastIndexUpdate < 50) { // Reduced from 100ms to 50ms
      return;
    }

    this.lastIndexUpdate = now;
    this.searchableItems = [];
    this.indexVersion++;

    // Clear cache when index updates
    this.searchCache.clear();

    // Index tasks
    tasks.forEach(task => {
      const project = projects.find(p => p.id === task.projectId);
      const section = sections.find(s => s.id === task.sectionId);
      
      // Determine task status using consistent date logic (same as pages)
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      let status: 'completed' | 'active' | 'overdue' = 'active';
      if (task.completed) {
        status = 'completed';
      } else if (task.dueDate && task.dueDate < today) {
        status = 'overdue';
      }

      // Determine context (which page this task appears on) - same logic as navigation
      let context = 'All Tasks';
      if (task.completed) {
        context = 'Completed';
      } else if (!task.projectId) {
        context = 'Inbox';
      } else if (task.dueDate && task.dueDate <= today) {
        context = 'Today';
      } else if (task.projectId) {
        // Tasks with projects appear on their project page
        const project = projects.find(p => p.id === task.projectId);
        context = project ? project.name : 'Project';
      }

      this.searchableItems.push({
        id: task.id,
        type: 'task',
        title: task.title,
        description: task.description,
        context,
        projectName: project?.name,
        sectionName: section?.name,
        priority: task.priority,
        status,
        dueDate: task.dueDate,
        data: task,
      });
    });

    // Index projects
    projects.forEach(project => {
      this.searchableItems.push({
        id: project.id,
        type: 'project',
        title: project.name,
        description: `${project.taskCount} tasks`,
        context: 'Projects',
        data: project,
      });
    });

    // Index sections
    sections.forEach(section => {
      this.searchableItems.push({
        id: section.id,
        type: 'section',
        title: section.name,
        context: 'Board View',
        data: section,
      });
    });

    // Update Fuse index
    this.fuse.setCollection(this.searchableItems);
  }

  // Main search function with caching
  search(query: string, options: SearchOptions = {}): SearchResult[] {
    if (!query.trim()) return [];

    const { limit = 8, threshold = 0.4 } = options;
    const cacheKey = `${query.toLowerCase()}-${limit}-${threshold}-${this.indexVersion}`;

    // Check cache first
    if (this.searchCache.has(cacheKey)) {
      return this.searchCache.get(cacheKey)!;
    }

    // Check for special keyword searches first
    const keywordResults = this.handleKeywordSearch(query);
    if (keywordResults.length > 0) {
      const results = keywordResults.slice(0, limit);
      this.searchCache.set(cacheKey, results);
      return results;
    }

    // Perform fuzzy search
    const fuseResults = this.fuse.search(query, { limit });

    const results = fuseResults.map(result => ({
      ...result.item,
      score: result.score,
      matches: result.matches,
    }));

    // Cache results
    this.searchCache.set(cacheKey, results);

    // Limit cache size
    if (this.searchCache.size > 100) {
      const firstKey = this.searchCache.keys().next().value;
      this.searchCache.delete(firstKey);
    }

    return results;
  }

  // Handle special keyword searches like "priority:high", "due:today", etc.
  private handleKeywordSearch(query: string): SearchResult[] {
    const lowerQuery = query.toLowerCase().trim();
    let results: SearchResult[] = [];

    // Priority search: "priority:high", "high priority", "p:high"
    const priorityMatch = lowerQuery.match(/(?:priority:|p:)?(high|medium|low)(?:\s+priority)?/);
    if (priorityMatch) {
      const priority = priorityMatch[1] as 'high' | 'medium' | 'low';
      results = this.searchableItems
        .filter(item => item.type === 'task' && item.priority === priority)
        .map(item => ({ ...item, score: 0 }));
    }

    // Project search: "project:Work", "proj:Personal", "in:Work"
    const projectMatch = lowerQuery.match(/(?:project:|proj:|in:)([^\s]+)/);
    if (projectMatch) {
      const projectName = projectMatch[1];
      results = this.searchableItems
        .filter(item =>
          item.type === 'task' &&
          item.projectName &&
          item.projectName.toLowerCase().includes(projectName)
        )
        .map(item => ({ ...item, score: 0 }));
    }

    // Status search: "status:completed", "completed", "done", "finished"
    if (lowerQuery.match(/(?:status:)?(completed|done|finished)/)) {
      results = this.searchableItems
        .filter(item => item.type === 'task' && item.status === 'completed')
        .map(item => ({ ...item, score: 0 }));
    }

    // Active status search: "status:active", "active", "pending"
    if (lowerQuery.match(/(?:status:)?(active|pending)/)) {
      results = this.searchableItems
        .filter(item => item.type === 'task' && item.status === 'active')
        .map(item => ({ ...item, score: 0 }));
    }

    // Overdue search: "overdue", "late", "status:overdue"
    if (lowerQuery.match(/(?:status:)?(overdue|late)/)) {
      results = this.searchableItems
        .filter(item => item.type === 'task' && item.status === 'overdue')
        .map(item => ({ ...item, score: 0 }));
    }

    // Due date searches - use consistent date logic
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    // Due today: "due:today", "today"
    if (lowerQuery.match(/\b(due:today|today)\b/)) {
      results = this.searchableItems
        .filter(item => {
          if (item.type !== 'task' || !item.dueDate) return false;
          return item.dueDate >= today && item.dueDate < tomorrow;
        })
        .map(item => ({ ...item, score: 0 }));
    }

    // Due tomorrow: "due:tomorrow", "tomorrow"
    if (lowerQuery.match(/\b(due:tomorrow|tomorrow)\b/)) {
      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

      results = this.searchableItems
        .filter(item => {
          if (item.type !== 'task' || !item.dueDate) return false;
          return item.dueDate >= tomorrow && item.dueDate < dayAfterTomorrow;
        })
        .map(item => ({ ...item, score: 0 }));
    }

    // Due this week: "due:week", "this week"
    if (lowerQuery.match(/\b(due:week|this\s+week)\b/)) {
      results = this.searchableItems
        .filter(item => {
          if (item.type !== 'task' || !item.dueDate) return false;
          return item.dueDate >= today && item.dueDate < nextWeek;
        })
        .map(item => ({ ...item, score: 0 }));
    }

    // No due date: "no:due", "no due", "unscheduled"
    if (lowerQuery.match(/\b(no:due|no\s+due|unscheduled)\b/)) {
      results = this.searchableItems
        .filter(item => item.type === 'task' && !item.dueDate)
        .map(item => ({ ...item, score: 0 }));
    }

    return results;
  }

  // Get all items of a specific type
  getItemsByType(type: 'task' | 'project' | 'section'): SearchableItem[] {
    return this.searchableItems.filter(item => item.type === type);
  }

  // Get recent searches (to be implemented with localStorage)
  getRecentSearches(): string[] {
    const recent = localStorage.getItem('taskflow.recentSearches');
    return recent ? JSON.parse(recent) : [];
  }

  // Save search to recent searches
  saveRecentSearch(query: string) {
    if (!query.trim()) return;

    const recent = this.getRecentSearches();
    const filtered = recent.filter(q => q !== query);
    const updated = [query, ...filtered].slice(0, 10); // Keep last 10

    localStorage.setItem('taskflow.recentSearches', JSON.stringify(updated));
  }

  // Get smart suggestions based on current query
  getSuggestions(query: string, currentPage?: string): string[] {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();
    const suggestions: string[] = [];

    // Project name suggestions
    const uniqueProjects = [...new Set(this.searchableItems
      .filter(item => item.projectName)
      .map(item => item.projectName!)
    )];

    uniqueProjects.forEach(projectName => {
      if (projectName.toLowerCase().includes(lowerQuery)) {
        suggestions.push(`project:${projectName}`);
      }
    });

    // Priority suggestions
    if ('high'.includes(lowerQuery) || 'priority'.includes(lowerQuery)) {
      suggestions.push('priority:high');
    }
    if ('medium'.includes(lowerQuery) || 'priority'.includes(lowerQuery)) {
      suggestions.push('priority:medium');
    }
    if ('low'.includes(lowerQuery) || 'priority'.includes(lowerQuery)) {
      suggestions.push('priority:low');
    }

    // Status suggestions
    if ('completed'.includes(lowerQuery) || 'done'.includes(lowerQuery)) {
      suggestions.push('status:completed');
    }
    if ('active'.includes(lowerQuery) || 'pending'.includes(lowerQuery)) {
      suggestions.push('status:active');
    }
    if ('overdue'.includes(lowerQuery) || 'late'.includes(lowerQuery)) {
      suggestions.push('overdue');
    }

    // Date suggestions
    if ('today'.includes(lowerQuery) || 'due'.includes(lowerQuery)) {
      suggestions.push('due:today');
    }
    if ('tomorrow'.includes(lowerQuery) || 'due'.includes(lowerQuery)) {
      suggestions.push('due:tomorrow');
    }
    if ('week'.includes(lowerQuery) || 'due'.includes(lowerQuery)) {
      suggestions.push('due:week');
    }

    // Current page scoped search
    if (currentPage) {
      suggestions.push(`Search in ${currentPage}`);
    }

    return suggestions.slice(0, 5); // Limit to 5 suggestions
  }

  // Get search suggestions for autocomplete
  getAutocompleteSuggestions(query: string): string[] {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();
    const suggestions: Set<string> = new Set();

    // Task title suggestions
    this.searchableItems
      .filter(item => item.type === 'task')
      .forEach(item => {
        if (item.title.toLowerCase().includes(lowerQuery)) {
          suggestions.add(item.title);
        }
      });

    // Project name suggestions
    this.searchableItems
      .filter(item => item.projectName)
      .forEach(item => {
        if (item.projectName!.toLowerCase().includes(lowerQuery)) {
          suggestions.add(item.projectName!);
        }
      });

    return Array.from(suggestions).slice(0, 5);
  }

  // Categorize search results by type
  categorizeResults(results: SearchResult[]): {
    tasks: SearchResult[];
    projects: SearchResult[];
    sections: SearchResult[];
  } {
    return {
      tasks: results.filter(r => r.type === 'task'),
      projects: results.filter(r => r.type === 'project'),
      sections: results.filter(r => r.type === 'section'),
    };
  }

  // Get search results with enhanced context for current page
  searchWithContext(query: string, currentPage?: string, options: SearchOptions = {}): {
    results: SearchResult[];
    categorized: {
      tasks: SearchResult[];
      projects: SearchResult[];
      sections: SearchResult[];
    };
    suggestions: string[];
  } {
    const results = this.search(query, options);
    const categorized = this.categorizeResults(results);
    const suggestions = this.getSuggestions(query, currentPage);

    return {
      results,
      categorized,
      suggestions,
    };
  }

  // Filter results by current page context
  filterByPageContext(results: SearchResult[], currentPage: string): SearchResult[] {
    switch (currentPage.toLowerCase()) {
      case 'today':
        return results.filter(result => {
          if (result.type !== 'task') return false;
          const task = result.data as any;
          if (!task.dueDate) return false;

          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);

          return (task.dueDate >= today && task.dueDate < tomorrow) || task.dueDate < today;
        });

      case 'inbox':
        return results.filter(result => {
          if (result.type !== 'task') return false;
          const task = result.data as any;
          return !task.projectId;
        });

      case 'completed':
        return results.filter(result => {
          if (result.type !== 'task') return false;
          return result.status === 'completed';
        });

      default:
        return results;
    }
  }
}

// Singleton instance
export const searchService = new SearchService();
