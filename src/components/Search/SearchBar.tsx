import React, { useRef, useEffect, useState } from 'react';
import { Search, X, Filter, Clock, Zap } from 'lucide-react';
import { useSearchHook } from '../../hooks/useSearchHook';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { SearchResults } from './SearchResults';
import { SearchFilters } from './SearchFilters';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  showFilters?: boolean;
  compact?: boolean;
}

export function SearchBar({ 
  placeholder = "Search tasks, projects...", 
  className,
  showFilters = true,
  compact = false 
}: SearchBarProps) {
  const searchHook = useSearchHook();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Focus input when search becomes active
  useEffect(() => {
    if (searchHook.isActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchHook.isActive]);

  // Handle click outside to close search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (searchHook.isActive && !searchHook.query.trim()) {
          searchHook.setActive(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchHook]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    searchHook.setQuery(value);
    
    if (!searchHook.isActive && value.trim()) {
      searchHook.setActive(true);
    }
  };

  const handleInputFocus = () => {
    searchHook.setActive(true);
  };

  const handleClearSearch = () => {
    searchHook.clearSearch();
    inputRef.current?.focus();
  };

  const handleFilterChange = (filters: any) => {
    searchHook.setFilters(filters);
    setShowFilterDropdown(false);
  };

  const activeFiltersCount = Object.keys(searchHook.filters).filter(
    key => searchHook.filters[key as keyof typeof searchHook.filters] !== undefined
  ).length;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Search Input */}
      <div className={cn(
        "relative flex items-center",
        compact ? "w-64" : "w-full max-w-md"
      )}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={searchHook.query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            className={cn(
              "pl-10 pr-10",
              searchHook.isActive && "ring-2 ring-primary/20",
              compact && "h-9"
            )}
          />
          
          {/* Clear button */}
          {searchHook.query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>

        {/* Filter button */}
        {showFilters && (
          <DropdownMenu open={showFilterDropdown} onOpenChange={setShowFilterDropdown}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size={compact ? "sm" : "default"}
                className={cn(
                  "ml-2 relative",
                  activeFiltersCount > 0 && "border-primary"
                )}
              >
                <Filter className="w-4 h-4" />
                {activeFiltersCount > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center"
                  >
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <SearchFilters
                filters={searchHook.filters}
                onFiltersChange={handleFilterChange}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Search Results Dropdown */}
      {searchHook.isActive && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1">
          <div className="bg-white border border-border rounded-md shadow-lg max-h-96 overflow-hidden">
            {/* Recent searches and suggestions when no query */}
            {!searchHook.query.trim() && !searchHook.hasSearched && (
              <div className="p-3">
                {searchHook.recentSearches.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">Recent</span>
                    </div>
                    <div className="space-y-1">
                      {searchHook.recentSearches.slice(0, 5).map((search, index) => (
                        <button
                          key={index}
                          onClick={() => searchHook.setQuery(search)}
                          className="w-full text-left px-2 py-1 text-sm hover:bg-muted rounded"
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {/* Quick actions */}
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Quick actions</span>
                  </div>
                  <div className="space-y-1">
                    <button
                      onClick={() => searchHook.setQuery('priority:high')}
                      className="w-full text-left px-2 py-1 text-sm hover:bg-muted rounded"
                    >
                      High priority tasks
                    </button>
                    <button
                      onClick={() => searchHook.setQuery('status:overdue')}
                      className="w-full text-left px-2 py-1 text-sm hover:bg-muted rounded"
                    >
                      Overdue tasks
                    </button>
                    <button
                      onClick={() => searchHook.setQuery('due:today')}
                      className="w-full text-left px-2 py-1 text-sm hover:bg-muted rounded"
                    >
                      Due today
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Search suggestions while typing */}
            {searchHook.query.trim() && searchHook.suggestions.length > 0 && !searchHook.hasSearched && (
              <div className="p-3 border-b">
                <div className="text-xs font-medium text-muted-foreground mb-2">Suggestions</div>
                <div className="space-y-1">
                  {searchHook.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => searchHook.setQuery(suggestion)}
                      className="w-full text-left px-2 py-1 text-sm hover:bg-muted rounded"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results */}
            <SearchResults
              results={searchHook.results}
              isLoading={searchHook.isLoading}
              selectedIndex={searchHook.selectedIndex}
              onResultSelect={searchHook.selectResult}
              query={searchHook.query}
              hasSearched={searchHook.hasSearched}
            />
          </div>
        </div>
      )}

      {/* Keyboard shortcut hint */}
      {!searchHook.isActive && !compact && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <Badge variant="outline" className="text-xs">
            ⌘K
          </Badge>
        </div>
      )}
    </div>
  );
}
