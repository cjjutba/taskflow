import React from 'react';
import { 
  CheckSquare, 
  Folder, 
  Plus, 
  Calendar, 
  AlertTriangle,
  Clock,
  User,
  Tag
} from 'lucide-react';
import { SearchResult } from '../../types/search';
import { Task } from '../../types/task';
import { LoadingSpinner } from '../ui/loading-spinner';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  selectedIndex: number;
  onResultSelect: (resultId: string) => void;
  query: string;
  hasSearched: boolean;
}

export function SearchResults({
  results,
  isLoading,
  selectedIndex,
  onResultSelect,
  query,
  hasSearched
}: SearchResultsProps) {
  const getResultIcon = (result: SearchResult) => {
    switch (result.type) {
      case 'task':
        const task = result.data as Task;
        return task.completed ? (
          <CheckSquare className="w-4 h-4 text-green-600" />
        ) : (
          <CheckSquare className="w-4 h-4 text-muted-foreground" />
        );
      case 'project':
        return <Folder className="w-4 h-4 text-blue-600" />;
      case 'action':
        return <Plus className="w-4 h-4 text-primary" />;
      default:
        return <CheckSquare className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDueDate = (dueDate: Date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const taskDate = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
    
    if (taskDate.getTime() === today.getTime()) {
      return { text: 'Today', color: 'text-blue-600' };
    } else if (taskDate < today) {
      return { text: 'Overdue', color: 'text-red-600' };
    } else {
      return { 
        text: formatDistanceToNow(dueDate, { addSuffix: true }), 
        color: 'text-muted-foreground' 
      };
    }
  };

  const highlightText = (text: string, highlight?: string) => {
    if (!highlight) return text;
    
    // If highlight contains HTML marks, use it directly
    if (highlight.includes('<mark>')) {
      return <span dangerouslySetInnerHTML={{ __html: highlight }} />;
    }
    
    return text;
  };

  if (isLoading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <LoadingSpinner size="sm" />
        <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
      </div>
    );
  }

  if (hasSearched && results.length === 0 && query.trim()) {
    return (
      <div className="p-4 text-center">
        <div className="text-muted-foreground mb-2">
          <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No results found for "{query}"</p>
          <p className="text-xs mt-1">Try adjusting your search or filters</p>
        </div>
      </div>
    );
  }

  if (!hasSearched && !query.trim()) {
    return null;
  }

  return (
    <div className="max-h-80 overflow-y-auto">
      {results.map((result, index) => (
        <div
          key={result.id}
          onClick={() => onResultSelect(result.id)}
          className={cn(
            "px-3 py-2 cursor-pointer border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors",
            selectedIndex === index && "bg-muted"
          )}
        >
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">
              {getResultIcon(result)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {/* Title */}
                  <div className="font-medium text-sm text-foreground truncate">
                    {highlightText(result.title, result.highlights?.title)}
                  </div>

                  {/* Description */}
                  {result.description && (
                    <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {highlightText(result.description, result.highlights?.description)}
                    </div>
                  )}

                  {/* Context and metadata */}
                  <div className="flex items-center gap-2 mt-1">
                    {/* Result type badge */}
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      {result.type}
                    </Badge>

                    {/* Project context */}
                    {result.context?.projectName && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Folder className="w-3 h-3" />
                        <span>{result.context.projectName}</span>
                      </div>
                    )}

                    {/* Task-specific metadata */}
                    {result.type === 'task' && (
                      <>
                        {/* Priority */}
                        {(result.data as Task).priority && (
                          <Badge 
                            variant="outline" 
                            className={cn("text-xs px-1 py-0", getPriorityColor((result.data as Task).priority))}
                          >
                            {(result.data as Task).priority}
                          </Badge>
                        )}

                        {/* Due date */}
                        {(result.data as Task).dueDate && (
                          <div className="flex items-center gap-1 text-xs">
                            <Calendar className="w-3 h-3" />
                            <span className={formatDueDate((result.data as Task).dueDate).color}>
                              {formatDueDate((result.data as Task).dueDate).text}
                            </span>
                          </div>
                        )}

                        {/* Completion status */}
                        {(result.data as Task).completed && (
                          <Badge variant="outline" className="text-xs px-1 py-0 text-green-600 bg-green-50">
                            Completed
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Relevance score (for debugging) */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="text-xs text-muted-foreground">
                    {Math.round(result.relevance * 100)}%
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Show more results hint */}
      {results.length >= 10 && (
        <div className="p-2 text-center border-t">
          <p className="text-xs text-muted-foreground">
            Showing first 10 results. Press Enter to see all results.
          </p>
        </div>
      )}
    </div>
  );
}
