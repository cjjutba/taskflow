import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import { useTask } from '../../contexts/TaskContext';
import { Task, Project } from '../../types/task';

interface SearchResult {
  id: string;
  type: 'task' | 'project';
  title: string;
  description?: string;
  data: Task | Project;
}

interface HeaderSearchBarProps {
  className?: string;
}

export function HeaderSearchBar({ className }: HeaderSearchBarProps) {
  const [query, setQuery] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { state } = useTask();

  // Simple search function (basic implementation)
  const performSearch = (searchQuery: string): SearchResult[] => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const searchResults: SearchResult[] = [];

    // Search tasks
    state.tasks.forEach(task => {
      if (
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query)
      ) {
        searchResults.push({
          id: task.id,
          type: 'task',
          title: task.title,
          description: task.description,
          data: task
        });
      }
    });

    // Search projects
    state.projects.forEach(project => {
      if (
        project.name.toLowerCase().includes(query) ||
        (project.description && project.description.toLowerCase().includes(query))
      ) {
        searchResults.push({
          id: project.id,
          type: 'project',
          title: project.name,
          description: project.description,
          data: project
        });
      }
    });

    return searchResults.slice(0, 8); // Limit results
  };

  // Handle input change with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        const searchResults = performSearch(query);
        setResults(searchResults);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, state.tasks, state.projects]);

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

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsActive(false);
      }
    };

    if (isActive) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isActive]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleInputFocus = () => {
    setIsActive(true);
  };

  const handleClearSearch = () => {
    setQuery('');
    setResults([]);
    inputRef.current?.focus();
  };

  const handleResultClick = (result: SearchResult) => {
    // TODO: Navigate to result or open modal
    console.log('Selected result:', result);
    setIsActive(false);
    setQuery('');
    setResults([]);
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
              ⌘K
            </Badge>
          )}
        </div>
      </div>

      {/* Search Results Dropdown */}
      {isActive && (query.trim() || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg max-h-80 overflow-y-auto z-50">
          {results.length > 0 ? (
            <div className="py-2">
              {results.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className="w-full px-3 py-2 text-left hover:bg-muted transition-colors flex items-start gap-3"
                >
                  <div className="flex-shrink-0 mt-1">
                    {result.type === 'task' ? (
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">
                      {result.title}
                    </div>
                    {result.description && (
                      <div className="text-xs text-muted-foreground truncate mt-0.5">
                        {result.description}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-0.5 capitalize">
                      {result.type}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : query.trim() ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No results found for "{query}"
            </div>
          ) : (
            <div className="py-4 px-3 text-xs text-muted-foreground">
              <div className="mb-2 font-medium">Quick tips:</div>
              <div>• Press ⌘K to focus search</div>
              <div>• Search tasks and projects</div>
              <div>• Press Escape to close</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
