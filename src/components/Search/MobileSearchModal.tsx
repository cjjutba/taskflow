import React, { useState, useRef, useEffect } from 'react';
import { Search, X, ArrowLeft, Hash, Clock, Lightbulb } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Dialog, DialogContent } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import { useTask } from '../../contexts/TaskContext';
import { searchService, SearchResult } from '../../services/searchService';
import { navigationService } from '../../services/navigationService';
import { HighlightedText } from '../../utils/textHighlighting';
import { UrlService } from '../../services/urlService';

interface MobileSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSearchModal({ isOpen, onClose }: MobileSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [categorizedResults, setCategorizedResults] = useState<{
    tasks: SearchResult[];
    projects: SearchResult[];
    sections: SearchResult[];
  }>({ tasks: [], projects: [], sections: [] });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const { state, dispatch } = useTask();
  const navigate = useNavigate();
  const location = useLocation();
  const urlService = new UrlService();

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

  // Initialize search service
  useEffect(() => {
    if (isOpen) {
      searchService.updateIndex(state.tasks, state.projects, state.sections);
      navigationService.setContext({ navigate, dispatch });
      setRecentSearches(searchService.getRecentSearches());
      
      // Focus input when modal opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, state.tasks, state.projects, state.sections, navigate, dispatch]);

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        const currentPage = getCurrentPageName();
        const searchData = searchService.searchWithContext(query, currentPage, { limit: 20 });
        
        setResults(searchData.results);
        setCategorizedResults(searchData.categorized);
        setSuggestions(searchData.suggestions);
        setSelectedIndex(-1);
      } else {
        setResults([]);
        setCategorizedResults({ tasks: [], projects: [], sections: [] });
        setSuggestions([]);
        setSelectedIndex(-1);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, location.pathname]);

  const handleResultClick = (result: SearchResult) => {
    // Save to recent searches
    searchService.saveRecentSearch(query);
    setRecentSearches(searchService.getRecentSearches());

    // Navigate to result using URL service with project context
    const targetUrl = urlService.getSearchResultUrlWithProject(result, state.projects);
    navigate(targetUrl);

    // Close modal
    onClose();
    setQuery('');
    setResults([]);
    setSelectedIndex(-1);
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

  const handleRecentSearchClick = (recentQuery: string) => {
    setQuery(recentQuery);
    inputRef.current?.focus();
  };

  const handleClearSearch = () => {
    setQuery('');
    setResults([]);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const renderResultItem = (result: SearchResult, index: number, globalIndex: number) => {
    const status = navigationService.getResultStatus(result);
    const context = navigationService.getResultContext(result);
    const isSelected = globalIndex === selectedIndex;
    
    return (
      <button
        key={`${result.type}-${result.id}`}
        onClick={() => handleResultClick(result)}
        className={cn(
          "w-full p-4 text-left transition-colors flex items-start gap-3 border-b border-border last:border-b-0",
          isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted active:bg-muted/80"
        )}
      >
        <div className="flex-shrink-0 mt-1">
          <span className="text-lg">{navigationService.getResultIcon(result)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-base font-medium text-foreground mb-1">
            <HighlightedText 
              text={result.title} 
              query={query}
              highlightClassName="bg-primary/20 text-primary px-1 rounded"
            />
          </div>
          {result.description && (
            <div className="text-sm text-muted-foreground mb-2 line-clamp-2">
              <HighlightedText 
                text={result.description} 
                query={query}
                highlightClassName="bg-primary/15 text-primary px-1 rounded"
              />
            </div>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn("text-xs px-2 py-1 rounded-full", status.color, "bg-current/10")}>
              {status.label}
            </span>
            {context && (
              <span className="text-xs text-muted-foreground">
                {context}
              </span>
            )}
          </div>
        </div>
      </button>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-full h-full max-h-full rounded-none border-0 bg-background">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-10">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                type="text"
                placeholder="Search tasks, projects..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-10 h-10 bg-muted/50 border-0 focus:bg-background focus:ring-1 focus:ring-primary/20"
              />
              {query && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {results.length > 0 ? (
              <div>
                {/* Suggestions */}
                {suggestions.length > 0 && (
                  <div className="p-4 border-b border-border">
                    <div className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Suggestions
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="text-sm px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Hash className="w-3 h-3" />
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Results */}
                {categorizedResults.tasks.length > 0 && (
                  <div>
                    <div className="px-4 py-3 bg-muted/30 text-sm font-medium text-muted-foreground flex items-center gap-2">
                      📋 Tasks ({categorizedResults.tasks.length})
                    </div>
                    {categorizedResults.tasks.map((result, index) => 
                      renderResultItem(result, index, index)
                    )}
                  </div>
                )}

                {categorizedResults.projects.length > 0 && (
                  <div>
                    <div className="px-4 py-3 bg-muted/30 text-sm font-medium text-muted-foreground flex items-center gap-2">
                      📁 Projects ({categorizedResults.projects.length})
                    </div>
                    {categorizedResults.projects.map((result, index) => 
                      renderResultItem(result, index, categorizedResults.tasks.length + index)
                    )}
                  </div>
                )}

                {categorizedResults.sections.length > 0 && (
                  <div>
                    <div className="px-4 py-3 bg-muted/30 text-sm font-medium text-muted-foreground flex items-center gap-2">
                      📑 Sections ({categorizedResults.sections.length})
                    </div>
                    {categorizedResults.sections.map((result, index) => 
                      renderResultItem(result, index, categorizedResults.tasks.length + categorizedResults.projects.length + index)
                    )}
                  </div>
                )}
              </div>
            ) : query.trim() ? (
              <div className="p-8 text-center">
                <div className="text-lg text-muted-foreground mb-2">No results found</div>
                <div className="text-sm text-muted-foreground mb-4">
                  Try searching for tasks, projects, or use keywords like "priority:high"
                </div>
              </div>
            ) : (
              <div className="p-4">
                {recentSearches.length > 0 && (
                  <div className="mb-6">
                    <div className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Recent searches
                    </div>
                    <div className="space-y-2">
                      {recentSearches.slice(0, 5).map((recentQuery, index) => (
                        <button
                          key={index}
                          onClick={() => handleRecentSearchClick(recentQuery)}
                          className="w-full text-left p-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                        >
                          {recentQuery}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="text-sm text-muted-foreground">
                  <div className="mb-3 font-medium">Search tips:</div>
                  <div className="space-y-2">
                    <div>• Try "priority:high", "due:today", "project:Work"</div>
                    <div>• Search across tasks, projects, and sections</div>
                    <div>• Use keywords like "overdue" or "completed"</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
