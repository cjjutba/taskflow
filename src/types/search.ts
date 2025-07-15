import { Task, Project } from './task';

export interface SearchFilters {
  priority?: 'high' | 'medium' | 'low';
  status?: 'completed' | 'pending' | 'overdue';
  project?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  tags?: string[];
  createdBy?: string;
  dueDate?: 'today' | 'tomorrow' | 'this-week' | 'next-week' | 'overdue';
}

export interface SearchResult {
  id: string;
  type: 'task' | 'project' | 'section' | 'action';
  title: string;
  description?: string;
  score: number;
  relevance: number;
  context?: {
    projectName?: string;
    sectionName?: string;
    path?: string;
  };
  data: Task | Project | SearchAction;
  highlights?: {
    title?: string;
    description?: string;
  };
}

export interface SearchAction {
  id: string;
  label: string;
  description: string;
  action: () => void;
  icon?: string;
}

export interface SearchState {
  query: string;
  isActive: boolean;
  results: SearchResult[];
  recentSearches: string[];
  filters: SearchFilters;
  isLoading: boolean;
  selectedIndex: number;
  suggestions: string[];
  hasSearched: boolean;
}

export type SearchActionType =
  | 'SET_QUERY'
  | 'SET_RESULTS'
  | 'TOGGLE_ACTIVE'
  | 'SET_ACTIVE'
  | 'ADD_RECENT_SEARCH'
  | 'CLEAR_RESULTS'
  | 'SET_LOADING'
  | 'SET_FILTERS'
  | 'SET_SELECTED_INDEX'
  | 'SET_SUGGESTIONS'
  | 'CLEAR_SEARCH'
  | 'RESET_SEARCH';

export interface SearchAction {
  type: SearchActionType;
  payload?: any;
}

export interface SearchOptions {
  includeCompleted?: boolean;
  includeArchived?: boolean;
  fuzzyThreshold?: number;
  maxResults?: number;
  sortBy?: 'relevance' | 'date' | 'priority' | 'alphabetical';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchQuery {
  text: string;
  filters: SearchFilters;
  options: SearchOptions;
}

// Search operators for advanced search
export interface SearchOperator {
  type: 'filter' | 'modifier' | 'date';
  key: string;
  value: string;
  operator?: 'equals' | 'contains' | 'before' | 'after' | 'between';
}

// Parsed search query with operators
export interface ParsedSearchQuery {
  text: string;
  operators: SearchOperator[];
  filters: SearchFilters;
}

// Search history item
export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: Date;
  resultCount: number;
  filters?: SearchFilters;
}

// Search analytics
export interface SearchAnalytics {
  totalSearches: number;
  popularQueries: { query: string; count: number }[];
  averageResultCount: number;
  searchPatterns: {
    timeOfDay: { hour: number; count: number }[];
    dayOfWeek: { day: string; count: number }[];
  };
}

// Search configuration
export interface SearchConfig {
  debounceMs: number;
  maxRecentSearches: number;
  maxSuggestions: number;
  fuzzyThreshold: number;
  enableAnalytics: boolean;
  enableVoiceSearch: boolean;
  keyboardShortcuts: {
    open: string;
    close: string;
    selectNext: string;
    selectPrev: string;
  };
}
