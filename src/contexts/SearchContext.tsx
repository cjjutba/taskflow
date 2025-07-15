import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { 
  SearchState, 
  SearchAction, 
  SearchFilters, 
  SearchResult,
  SearchHistoryItem,
  SearchConfig 
} from '../types/search';

const defaultConfig: SearchConfig = {
  debounceMs: 300,
  maxRecentSearches: 10,
  maxSuggestions: 5,
  fuzzyThreshold: 0.6,
  enableAnalytics: true,
  enableVoiceSearch: false,
  keyboardShortcuts: {
    open: 'ctrl+k',
    close: 'escape',
    selectNext: 'arrowdown',
    selectPrev: 'arrowup',
  },
};

const initialState: SearchState = {
  query: '',
  isActive: false,
  results: [],
  recentSearches: [],
  filters: {},
  isLoading: false,
  selectedIndex: -1,
  suggestions: [],
  hasSearched: false,
};

function searchReducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case 'SET_QUERY':
      return {
        ...state,
        query: action.payload,
        selectedIndex: -1,
      };

    case 'SET_RESULTS':
      return {
        ...state,
        results: action.payload,
        isLoading: false,
        hasSearched: true,
      };

    case 'TOGGLE_ACTIVE':
      return {
        ...state,
        isActive: !state.isActive,
        selectedIndex: -1,
      };

    case 'SET_ACTIVE':
      return {
        ...state,
        isActive: action.payload,
        selectedIndex: action.payload ? -1 : state.selectedIndex,
      };

    case 'ADD_RECENT_SEARCH':
      const newRecentSearches = [
        action.payload,
        ...state.recentSearches.filter(search => search !== action.payload)
      ].slice(0, defaultConfig.maxRecentSearches);
      
      return {
        ...state,
        recentSearches: newRecentSearches,
      };

    case 'CLEAR_RESULTS':
      return {
        ...state,
        results: [],
        hasSearched: false,
        selectedIndex: -1,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };

    case 'SET_SELECTED_INDEX':
      const maxIndex = state.results.length - 1;
      let newIndex = action.payload;
      
      if (newIndex < -1) newIndex = maxIndex;
      if (newIndex > maxIndex) newIndex = -1;
      
      return {
        ...state,
        selectedIndex: newIndex,
      };

    case 'SET_SUGGESTIONS':
      return {
        ...state,
        suggestions: action.payload,
      };

    case 'CLEAR_SEARCH':
      return {
        ...state,
        query: '',
        results: [],
        selectedIndex: -1,
        hasSearched: false,
        suggestions: [],
      };

    case 'RESET_SEARCH':
      return {
        ...initialState,
        recentSearches: state.recentSearches,
      };

    default:
      return state;
  }
}

interface SearchContextType {
  state: SearchState;
  dispatch: React.Dispatch<SearchAction>;
  config: SearchConfig;
  // Helper functions
  setQuery: (query: string) => void;
  setResults: (results: SearchResult[]) => void;
  toggleActive: () => void;
  setActive: (active: boolean) => void;
  addRecentSearch: (query: string) => void;
  clearResults: () => void;
  setLoading: (loading: boolean) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  setSelectedIndex: (index: number) => void;
  setSuggestions: (suggestions: string[]) => void;
  clearSearch: () => void;
  resetSearch: () => void;
  // Navigation helpers
  selectNext: () => void;
  selectPrevious: () => void;
  getSelectedResult: () => SearchResult | null;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(searchReducer, initialState);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    const savedSearches = localStorage.getItem('taskflow-recent-searches');
    if (savedSearches) {
      try {
        const recentSearches = JSON.parse(savedSearches);
        recentSearches.forEach((search: string) => {
          dispatch({ type: 'ADD_RECENT_SEARCH', payload: search });
        });
      } catch (error) {
        console.warn('Failed to load recent searches:', error);
      }
    }
  }, []);

  // Save recent searches to localStorage when they change
  useEffect(() => {
    localStorage.setItem('taskflow-recent-searches', JSON.stringify(state.recentSearches));
  }, [state.recentSearches]);

  // Helper functions
  const setQuery = useCallback((query: string) => {
    dispatch({ type: 'SET_QUERY', payload: query });
  }, []);

  const setResults = useCallback((results: SearchResult[]) => {
    dispatch({ type: 'SET_RESULTS', payload: results });
  }, []);

  const toggleActive = useCallback(() => {
    dispatch({ type: 'TOGGLE_ACTIVE' });
  }, []);

  const setActive = useCallback((active: boolean) => {
    dispatch({ type: 'SET_ACTIVE', payload: active });
  }, []);

  const addRecentSearch = useCallback((query: string) => {
    if (query.trim()) {
      dispatch({ type: 'ADD_RECENT_SEARCH', payload: query.trim() });
    }
  }, []);

  const clearResults = useCallback(() => {
    dispatch({ type: 'CLEAR_RESULTS' });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setFilters = useCallback((filters: Partial<SearchFilters>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const setSelectedIndex = useCallback((index: number) => {
    dispatch({ type: 'SET_SELECTED_INDEX', payload: index });
  }, []);

  const setSuggestions = useCallback((suggestions: string[]) => {
    dispatch({ type: 'SET_SUGGESTIONS', payload: suggestions });
  }, []);

  const clearSearch = useCallback(() => {
    dispatch({ type: 'CLEAR_SEARCH' });
  }, []);

  const resetSearch = useCallback(() => {
    dispatch({ type: 'RESET_SEARCH' });
  }, []);

  // Navigation helpers
  const selectNext = useCallback(() => {
    dispatch({ type: 'SET_SELECTED_INDEX', payload: state.selectedIndex + 1 });
  }, [state.selectedIndex]);

  const selectPrevious = useCallback(() => {
    dispatch({ type: 'SET_SELECTED_INDEX', payload: state.selectedIndex - 1 });
  }, [state.selectedIndex]);

  const getSelectedResult = useCallback((): SearchResult | null => {
    if (state.selectedIndex >= 0 && state.selectedIndex < state.results.length) {
      return state.results[state.selectedIndex];
    }
    return null;
  }, [state.selectedIndex, state.results]);

  const contextValue: SearchContextType = {
    state,
    dispatch,
    config: defaultConfig,
    setQuery,
    setResults,
    toggleActive,
    setActive,
    addRecentSearch,
    clearResults,
    setLoading,
    setFilters,
    setSelectedIndex,
    setSuggestions,
    clearSearch,
    resetSearch,
    selectNext,
    selectPrevious,
    getSelectedResult,
  };

  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = (): SearchContextType => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

export default SearchContext;
