import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Clock, ArrowRight, Lightbulb, Hash } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import { useTask } from '../../contexts/TaskContext';
import { searchService, SearchResult } from '../../services/searchService';
import { navigationService } from '../../services/navigationService';
import { urlService } from '../../services/urlService';
import { useKeyboardShortcuts, useIsMac } from '../../hooks/useKeyboardShortcuts';

import { MobileSearchModal } from '../Search/MobileSearchModal';
import { HighlightedText } from '../../utils/textHighlighting';
import { useIsMobile } from '../../hooks/use-mobile';
import { useSearchUrl } from '../../hooks/useSearchUrl';
import { useDebounce, useDebouncedCallback } from '../../hooks/useDebounce';

// Remove the old SearchResult interface since we're using the one from searchService

interface HeaderSearchBarProps {
  className?: string;
}

export function HeaderSearchBar({ className }: HeaderSearchBarProps) {
  const [query, setQuery] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [categorizedResults, setCategorizedResults] = useState<{
    tasks: SearchResult[];
    projects: SearchResult[];
    sections: SearchResult[];
  }>({ tasks: [], projects: [], sections: [] });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const [mobileModalOpen, setMobileModalOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { state, dispatch } = useTask();
  const navigate = useNavigate();
  const location = useLocation();
  const isMac = useIsMac();
  const isMobile = useIsMobile();
  const { searchParams, setSearchQuery, clearSearchParams } = useSearchUrl();

  // Initialize search service and navigation service
  useEffect(() => {
    searchService.updateIndex(state.tasks, state.projects, state.sections);
    navigationService.setContext({ navigate, dispatch });
    setRecentSearches(searchService.getRecentSearches());
  }, [state.tasks, state.projects, state.sections, navigate, dispatch]);

  // Initialize query from URL on mount only
  useEffect(() => {
    if (searchParams.query && !query) {
      setQuery(searchParams.query);
      setIsActive(true);
    }
  }, []); // Empty dependency array - only run on mount

  // Get current page name for context
  const getCurrentPageName = () => {
    switch (location.pathname) {
      case '/': return 'Today';
      case '/inbox': return 'Inbox';
      case '/all-tasks': return 'All Tasks';
      case '/completed': return 'Completed';
      case '/analytics': return 'Analytics';
      default:
        if (location.pathname.startsWith('/project/')) return 'Project';
        return 'All Tasks';
    }
  };

  // Debounced search query
  const debouncedQuery = useDebounce(query, 300);

  // Debounced search function
  const performSearch = useDebouncedCallback((searchQuery: string) => {
    if (searchQuery.trim()) {
      const currentPage = getCurrentPageName();
      const searchData = searchService.searchWithContext(searchQuery, currentPage, { limit: 12 });

      setResults(searchData.results);
      setCategorizedResults(searchData.categorized);
      setSuggestions(searchData.suggestions);
      setSelectedIndex(-1); // Reset selection
    } else {
      setResults([]);
      setCategorizedResults({ tasks: [], projects: [], sections: [] });
      setSuggestions([]);
      setSelectedIndex(-1);
    }
  }, 200, [location.pathname]);

  // Perform search when debounced query changes
  useEffect(() => {
    performSearch(debouncedQuery);
  }, [debouncedQuery, performSearch]);

  // Update URL when debounced query changes (separate from search)
  useEffect(() => {
    // Only update URL if the query is different from current URL params
    if (debouncedQuery.trim() && debouncedQuery !== searchParams.query) {
      setSearchQuery(debouncedQuery, true);
    } else if (!debouncedQuery.trim() && searchParams.query) {
      clearSearchParams();
    }
  }, [debouncedQuery, searchParams.query, setSearchQuery, clearSearchParams]);



  // Handle click outside to close search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsActive(false);
      }
    };

    if (isActive) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isActive]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+K or Cmd+K to focus search
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
        setIsActive(true);
      }

      // Escape to close search
      if (event.key === 'Escape' && isActive) {
        setIsActive(false);
        setQuery('');
        setResults([]);
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive]);

  // Keyboard shortcut handlers
  const searchKeyboardHandlers = {
    onSearchFocus: () => {
      if (isMobile) {
        setMobileModalOpen(true);
      } else {
        inputRef.current?.focus();
        setIsActive(true);
      }
    },
    onSearchEscape: () => {
      setQuery('');
      setResults([]);
      setIsActive(false);
      setSelectedIndex(-1);
      inputRef.current?.blur();
    },
    onSearchArrowUp: () => {
      setSelectedIndex(prev => Math.max(-1, prev - 1));
    },
    onSearchArrowDown: () => {
      setSelectedIndex(prev => Math.min(results.length - 1, prev + 1));
    },
    onSearchEnter: () => {
      if (selectedIndex >= 0 && results[selectedIndex]) {
        // Get the selected result and navigate to its URL
        const selectedResult = results[selectedIndex];
        const targetUrl = urlService.getSearchResultUrlWithProject(selectedResult, state.projects);

        // Handle the result click (save to recent searches, close search)
        handleResultClick(selectedResult);

        // Navigate to the URL
        navigate(targetUrl);
      } else if (results.length > 0) {
        // Navigate to first result
        const firstResult = results[0];
        const targetUrl = urlService.getSearchResultUrlWithProject(firstResult, state.projects);

        handleResultClick(firstResult);
        navigate(targetUrl);
      }
    },
    onSearchTab: () => {
      // Cycle through result types or show more results
      setSelectedIndex(prev => (prev + 1) % results.length);
    }
  };

  // Use keyboard shortcuts
  useKeyboardShortcuts(searchKeyboardHandlers);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsActive(false);
        setSelectedIndex(-1);
      }
    };

    if (isActive) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isActive]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
  };

  const handleInputFocus = () => {
    if (isMobile) {
      setMobileModalOpen(true);
      inputRef.current?.blur(); // Prevent keyboard on mobile
    } else {
      setIsActive(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding to allow for result clicks
    setTimeout(() => {
      setIsActive(false);
    }, 150);
  };

  const handleClearSearch = () => {
    setQuery('');
    setResults([]);
    setSelectedIndex(-1);
    clearSearchParams();
    inputRef.current?.focus();
  };

  const handleResultClick = (result: SearchResult) => {
    // Save to recent searches
    searchService.saveRecentSearch(query);
    setRecentSearches(searchService.getRecentSearches());

    // Close search (navigation is handled by Link component)
    setIsActive(false);
    setQuery('');
    setResults([]);
    setSelectedIndex(-1);
    clearSearchParams();
    inputRef.current?.blur();
  };

  const handleRecentSearchClick = (recentQuery: string) => {
    setQuery(recentQuery);
    setIsActive(true);
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (suggestion.startsWith('Search in ')) {
      // Handle page-scoped search
      const currentPage = getCurrentPageName();
      const scopedResults = searchService.filterByPageContext(results, currentPage);
      setResults(scopedResults);
      setCategorizedResults(searchService.categorizeResults(scopedResults));
    } else {
      // Handle keyword suggestion
      setQuery(suggestion);
      inputRef.current?.focus();
    }
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search tasks, projects..."
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          data-search-input="true"
          className={cn(
            "w-full pl-10 pr-20 h-9 bg-muted/50 border-0 focus:bg-background focus:ring-1 focus:ring-primary/20 transition-all",
            isActive && "ring-1 ring-primary/20 bg-background"
          )}
        />
        
        {/* Right side controls */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="h-6 w-6 p-0 hover:bg-muted"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
          
          {!isActive && (
            <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-5">
              {isMac ? '⌘K' : 'Ctrl+K'}
            </Badge>
          )}
        </div>
      </div>

      {/* Search Results Dropdown */}
      {isActive && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg max-h-96 overflow-y-auto z-50">
          {results.length > 0 ? (
            <div className="py-2">
              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="px-3 py-2 border-b border-border">
                  <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    <Lightbulb className="w-3 h-3" />
                    Suggestions
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-xs px-2 py-1 bg-muted hover:bg-muted/80 rounded-md transition-colors flex items-center gap-1"
                      >
                        <Hash className="w-3 h-3" />
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Categorized Results */}
              {categorizedResults.tasks.length > 0 && (
                <div className="px-3 py-2">
                  <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    📋 Tasks ({categorizedResults.tasks.length})
                  </div>
                  {categorizedResults.tasks.map((result, index) => {
                    const globalIndex = index;
                    const status = navigationService.getResultStatus(result);
                    const context = navigationService.getResultContext(result);
                    const isSelected = globalIndex === selectedIndex;

                    return (
                      <Link
                        key={`task-${result.id}`}
                        to={urlService.getSearchResultUrlWithProject(result, state.projects)}
                        onClick={() => handleResultClick(result)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && isSelected) {
                            handleResultClick(result);
                          }
                        }}
                        className={cn(
                          "w-full px-2 py-2 text-left transition-colors flex items-start gap-3 rounded-md mb-1 block focus:outline-none",
                          isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted"
                        )}
                      >
                        <div className="flex-shrink-0 mt-1">
                          <span className="text-sm">{navigationService.getResultIcon(result)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground truncate">
                            <HighlightedText
                              text={result.title}
                              query={query}
                              highlightClassName="bg-primary/20 text-primary px-0.5 rounded"
                            />
                          </div>
                          {result.description && (
                            <div className="text-xs text-muted-foreground truncate mt-0.5">
                              <HighlightedText
                                text={result.description}
                                query={query}
                                highlightClassName="bg-primary/15 text-primary px-0.5 rounded"
                              />
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <span className={cn("text-xs", status.color)}>
                              {status.label}
                            </span>
                            {context && (
                              <>
                                <span className="text-xs text-muted-foreground">•</span>
                                <span className="text-xs text-muted-foreground truncate">
                                  {context}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="flex-shrink-0 mt-1">
                            <ArrowRight className="w-3 h-3 text-primary" />
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Projects */}
              {categorizedResults.projects.length > 0 && (
                <div className="px-3 py-2 border-t border-border">
                  <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    📁 Projects ({categorizedResults.projects.length})
                  </div>
                  {categorizedResults.projects.map((result, index) => {
                    const globalIndex = categorizedResults.tasks.length + index;
                    const isSelected = globalIndex === selectedIndex;

                    return (
                      <Link
                        key={`project-${result.id}`}
                        to={urlService.getSearchResultUrlWithProject(result, state.projects)}
                        onClick={() => handleResultClick(result)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && isSelected) {
                            handleResultClick(result);
                          }
                        }}
                        className={cn(
                          "w-full px-2 py-2 text-left transition-colors flex items-start gap-3 rounded-md mb-1 block focus:outline-none",
                          isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted"
                        )}
                      >
                        <div className="flex-shrink-0 mt-1">
                          <span className="text-sm">📁</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground truncate">
                            <HighlightedText
                              text={result.title}
                              query={query}
                              highlightClassName="bg-primary/20 text-primary px-0.5 rounded"
                            />
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {result.description}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="flex-shrink-0 mt-1">
                            <ArrowRight className="w-3 h-3 text-primary" />
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Sections */}
              {categorizedResults.sections.length > 0 && (
                <div className="px-3 py-2 border-t border-border">
                  <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    📑 Sections ({categorizedResults.sections.length})
                  </div>
                  {categorizedResults.sections.map((result, index) => {
                    const globalIndex = categorizedResults.tasks.length + categorizedResults.projects.length + index;
                    const isSelected = globalIndex === selectedIndex;

                    return (
                      <Link
                        key={`section-${result.id}`}
                        to={urlService.getSearchResultUrlWithProject(result, state.projects)}
                        onClick={() => handleResultClick(result)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && isSelected) {
                            handleResultClick(result);
                          }
                        }}
                        className={cn(
                          "w-full px-2 py-2 text-left transition-colors flex items-start gap-3 rounded-md mb-1 block focus:outline-none",
                          isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted"
                        )}
                      >
                        <div className="flex-shrink-0 mt-1">
                          <span className="text-sm">📑</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground truncate">
                            <HighlightedText
                              text={result.title}
                              query={query}
                              highlightClassName="bg-primary/20 text-primary px-0.5 rounded"
                            />
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {result.context}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="flex-shrink-0 mt-1">
                            <ArrowRight className="w-3 h-3 text-primary" />
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ) : query.trim() ? (
            <div className="py-8 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <div className="text-sm text-muted-foreground mb-2">
                No results found for "{query}"
              </div>
              <div className="text-xs text-muted-foreground mb-4">
                Try searching for tasks, projects, or use keywords like:
              </div>
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {['priority:high', 'due:today', 'overdue', 'completed'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-xs px-2 py-1 bg-muted hover:bg-muted/80 rounded-md transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              <div className="text-xs text-muted-foreground">
                Or try a different search term
              </div>
            </div>
          ) : (
            <div className="py-4 px-3">
              {recentSearches.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Recent searches
                  </div>
                  <div className="space-y-1">
                    {recentSearches.slice(0, 3).map((recentQuery, index) => (
                      <button
                        key={index}
                        onClick={() => handleRecentSearchClick(recentQuery)}
                        className="w-full text-left px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                      >
                        {recentQuery}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                <div className="mb-2 font-medium">Search tips:</div>
                <div>• Press {isMac ? '⌘K' : 'Ctrl+K'} to focus search</div>
                <div>• Try "priority:high", "due:today", "project:Work"</div>
                <div>• Use ↑↓ arrows to navigate, Enter to select</div>
                <div>• Press Escape to close</div>
              </div>
            </div>
          )}
        </div>
      )}



      {/* Mobile Search Modal */}
      <MobileSearchModal
        isOpen={mobileModalOpen}
        onClose={() => setMobileModalOpen(false)}
      />
    </div>
  );
}
