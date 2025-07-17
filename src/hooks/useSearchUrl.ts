import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export interface SearchUrlParams {
  query?: string;
  type?: 'task' | 'project' | 'section' | 'all';
  priority?: 'high' | 'medium' | 'low';
  status?: 'active' | 'completed' | 'overdue';
  project?: string;
  page?: number;
}

export function useSearchUrl() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useState<SearchUrlParams>({});

  // Parse URL parameters
  const parseUrlParams = useCallback((): SearchUrlParams => {
    const urlParams = new URLSearchParams(location.search);
    
    return {
      query: urlParams.get('q') || undefined,
      type: (urlParams.get('type') as SearchUrlParams['type']) || undefined,
      priority: (urlParams.get('priority') as SearchUrlParams['priority']) || undefined,
      status: (urlParams.get('status') as SearchUrlParams['status']) || undefined,
      project: urlParams.get('project') || undefined,
      page: urlParams.get('page') ? parseInt(urlParams.get('page')!) : undefined,
    };
  }, [location.search]);

  // Update URL with search parameters
  const updateUrl = useCallback((params: Partial<SearchUrlParams>, replace: boolean = false) => {
    const urlParams = new URLSearchParams(location.search);
    
    // Update or remove parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        urlParams.set(key === 'query' ? 'q' : key, value.toString());
      } else {
        urlParams.delete(key === 'query' ? 'q' : key);
      }
    });

    // Clean up empty parameters
    const cleanParams = new URLSearchParams();
    urlParams.forEach((value, key) => {
      if (value.trim()) {
        cleanParams.set(key, value);
      }
    });

    const newSearch = cleanParams.toString();
    const newUrl = `${location.pathname}${newSearch ? `?${newSearch}` : ''}`;
    
    if (replace) {
      navigate(newUrl, { replace: true });
    } else {
      navigate(newUrl);
    }
  }, [location.pathname, location.search, navigate]);

  // Clear all search parameters
  const clearSearchParams = useCallback(() => {
    navigate(location.pathname, { replace: true });
  }, [location.pathname, navigate]);

  // Set search query
  const setSearchQuery = useCallback((query: string, replace: boolean = true) => {
    updateUrl({ query }, replace);
  }, [updateUrl]);

  // Set search filters
  const setSearchFilters = useCallback((filters: Omit<SearchUrlParams, 'query'>, replace: boolean = true) => {
    updateUrl(filters, replace);
  }, [updateUrl]);

  // Get search URL for sharing
  const getSearchUrl = useCallback((params: SearchUrlParams): string => {
    const urlParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        urlParams.set(key === 'query' ? 'q' : key, value.toString());
      }
    });

    const search = urlParams.toString();
    return `${window.location.origin}${location.pathname}${search ? `?${search}` : ''}`;
  }, [location.pathname]);

  // Check if search is active
  const hasActiveSearch = useCallback((): boolean => {
    const params = parseUrlParams();
    return !!(params.query || params.type || params.priority || params.status || params.project);
  }, [parseUrlParams]);

  // Get search summary for display
  const getSearchSummary = useCallback((): string => {
    const params = parseUrlParams();
    const parts: string[] = [];

    if (params.query) {
      parts.push(`"${params.query}"`);
    }

    if (params.type && params.type !== 'all') {
      parts.push(`in ${params.type}s`);
    }

    if (params.priority) {
      parts.push(`${params.priority} priority`);
    }

    if (params.status) {
      parts.push(params.status);
    }

    if (params.project) {
      parts.push(`project: ${params.project}`);
    }

    return parts.length > 0 ? `Searching for ${parts.join(', ')}` : '';
  }, [parseUrlParams]);

  // Update state when URL changes
  useEffect(() => {
    setSearchParams(parseUrlParams());
  }, [parseUrlParams]);

  // Browser back/forward handling
  useEffect(() => {
    const handlePopState = () => {
      setSearchParams(parseUrlParams());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [parseUrlParams]);

  return {
    searchParams,
    updateUrl,
    clearSearchParams,
    setSearchQuery,
    setSearchFilters,
    getSearchUrl,
    hasActiveSearch,
    getSearchSummary,
    parseUrlParams,
  };
}

// Hook for search history management
export function useSearchHistory() {
  const [history, setHistory] = useState<SearchUrlParams[]>([]);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('taskflow.searchHistory');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (error) {
        console.warn('Failed to parse search history:', error);
      }
    }
  }, []);

  // Add search to history
  const addToHistory = useCallback((params: SearchUrlParams) => {
    if (!params.query && !params.type && !params.priority && !params.status && !params.project) {
      return; // Don't save empty searches
    }

    setHistory(prev => {
      // Remove duplicate if exists
      const filtered = prev.filter(item => 
        !(item.query === params.query && 
          item.type === params.type && 
          item.priority === params.priority && 
          item.status === params.status && 
          item.project === params.project)
      );

      // Add to beginning and limit to 20 items
      const updated = [params, ...filtered].slice(0, 20);
      
      // Save to localStorage
      localStorage.setItem('taskflow.searchHistory', JSON.stringify(updated));
      
      return updated;
    });
  }, []);

  // Clear history
  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem('taskflow.searchHistory');
  }, []);

  // Remove specific item from history
  const removeFromHistory = useCallback((index: number) => {
    setHistory(prev => {
      const updated = prev.filter((_, i) => i !== index);
      localStorage.setItem('taskflow.searchHistory', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return {
    history,
    addToHistory,
    clearHistory,
    removeFromHistory,
  };
}

// Utility function to build search URL
export function buildSearchUrl(baseUrl: string, params: SearchUrlParams): string {
  const urlParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      urlParams.set(key === 'query' ? 'q' : key, value.toString());
    }
  });

  const search = urlParams.toString();
  return `${baseUrl}${search ? `?${search}` : ''}`;
}
