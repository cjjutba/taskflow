import { useCallback, useEffect, useRef } from 'react';
import { useSearch } from '../contexts/SearchContext';
import { useTask } from '../contexts/TaskContext';
import { searchService } from '../services/searchService';
import { SearchOptions } from '../types/search';

export function useSearchHook() {
  const search = useSearch();
  const { state: taskState } = useTask();
  const debounceRef = useRef<NodeJS.Timeout>();

  // Initialize search indexes when tasks/projects change
  useEffect(() => {
    searchService.initializeIndexes(taskState.tasks, taskState.projects);
  }, [taskState.tasks, taskState.projects]);

  // Debounced search function
  const performSearch = useCallback((query: string, options: SearchOptions = {}) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (!query.trim()) {
        search.clearResults();
        return;
      }

      search.setLoading(true);

      const searchQuery = {
        text: query,
        filters: search.state.filters,
        options: {
          maxResults: 10,
          includeCompleted: true,
          sortBy: 'relevance',
          sortOrder: 'desc' as const,
          ...options,
        },
      };

      try {
        const results = searchService.search(searchQuery);
        search.setResults(results);
        
        // Update suggestions
        const suggestions = searchService.getSuggestions(query, search.state.recentSearches);
        search.setSuggestions(suggestions);
      } catch (error) {
        console.error('Search error:', error);
        search.setResults([]);
      } finally {
        search.setLoading(false);
      }
    }, search.config.debounceMs);
  }, [search, taskState]);

  // Handle search query change
  const handleQueryChange = useCallback((query: string) => {
    search.setQuery(query);
    performSearch(query);
  }, [search, performSearch]);

  // Handle search submission
  const handleSearchSubmit = useCallback(() => {
    const { query } = search.state;
    if (query.trim()) {
      search.addRecentSearch(query);
      performSearch(query, { maxResults: 50 });
    }
  }, [search, performSearch]);

  // Handle result selection
  const handleResultSelect = useCallback((resultId: string) => {
    const result = search.state.results.find(r => r.id === resultId);
    if (!result) return;

    // Add to recent searches
    search.addRecentSearch(search.state.query);

    // Handle different result types
    switch (result.type) {
      case 'task':
        // TODO: Navigate to task or open task modal
        console.log('Selected task:', result.data);
        break;
      case 'project':
        // TODO: Navigate to project page
        console.log('Selected project:', result.data);
        break;
      case 'action':
        // Execute the action
        if ('action' in result.data && typeof result.data.action === 'function') {
          result.data.action();
        }
        break;
    }

    // Close search
    search.setActive(false);
    search.clearSearch();
  }, [search]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!search.state.isActive) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        search.selectNext();
        break;
      case 'ArrowUp':
        event.preventDefault();
        search.selectPrevious();
        break;
      case 'Enter':
        event.preventDefault();
        const selectedResult = search.getSelectedResult();
        if (selectedResult) {
          handleResultSelect(selectedResult.id);
        } else {
          handleSearchSubmit();
        }
        break;
      case 'Escape':
        event.preventDefault();
        search.setActive(false);
        search.clearSearch();
        break;
    }
  }, [search, handleResultSelect, handleSearchSubmit]);

  // Handle global keyboard shortcuts
  const handleGlobalKeyDown = useCallback((event: KeyboardEvent) => {
    // Ctrl+K or Cmd+K to open search
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      search.setActive(true);
    }
  }, [search]);

  // Set up keyboard event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [handleKeyDown, handleGlobalKeyDown]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    // State
    query: search.state.query,
    results: search.state.results,
    isActive: search.state.isActive,
    isLoading: search.state.isLoading,
    selectedIndex: search.state.selectedIndex,
    suggestions: search.state.suggestions,
    recentSearches: search.state.recentSearches,
    filters: search.state.filters,
    hasSearched: search.state.hasSearched,

    // Actions
    setQuery: handleQueryChange,
    setActive: search.setActive,
    toggleActive: search.toggleActive,
    clearSearch: search.clearSearch,
    setFilters: search.setFilters,
    selectResult: handleResultSelect,
    submitSearch: handleSearchSubmit,

    // Navigation
    selectNext: search.selectNext,
    selectPrevious: search.selectPrevious,
    getSelectedResult: search.getSelectedResult,

    // Utilities
    performSearch,
  };
}
