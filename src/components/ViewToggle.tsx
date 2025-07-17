import React from 'react';
import { List, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTask } from '@/contexts/TaskContext';
import { cn } from '@/lib/utils';

export function ViewToggle() {
  const { state, dispatch } = useTask();

  const handleViewChange = (viewMode: 'list' | 'board') => {
    dispatch({ type: 'SET_VIEW_MODE', payload: viewMode });
    
    // Persist view preference in localStorage
    localStorage.setItem('taskManager.viewMode', viewMode);
  };

  return (
    <div className="flex items-center bg-muted rounded-md p-0.5 flex-shrink-0 view-toggle-container">
      <Button
        variant={state.ui.viewMode === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleViewChange('list')}
        className={cn(
          // Base: Ultra compact
          "h-6 px-1.5 gap-0.5 text-xs transition-all duration-200",
          // SM: Optimized for 640px-768px range
          "sm:h-7 sm:px-2 sm:gap-1 sm:text-xs",
          // MD: Better for 768px-1024px range
          "md:h-7 md:px-2.5 md:gap-1 md:text-sm",
          // XL: Full size
          "xl:h-8 xl:px-3 xl:gap-1.5",
          "view-toggle-button", // Apply responsive styles
          state.ui.viewMode === 'list'
            ? 'bg-background shadow-sm text-foreground'
            : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
        )}
      >
        <List className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-3.5 md:h-3.5 xl:w-4 xl:h-4 flex-shrink-0 task-header-icon" />
        <span className="font-medium text-xs sm:text-xs md:text-sm">List</span>
      </Button>

      <Button
        variant={state.ui.viewMode === 'board' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleViewChange('board')}
        className={cn(
          // Base: Ultra compact
          "h-6 px-1.5 gap-0.5 text-xs transition-all duration-200",
          // SM: Optimized for 640px-768px range
          "sm:h-7 sm:px-2 sm:gap-1 sm:text-xs",
          // MD: Better for 768px-1024px range
          "md:h-7 md:px-2.5 md:gap-1 md:text-sm",
          // XL: Full size
          "xl:h-8 xl:px-3 xl:gap-1.5",
          "view-toggle-button", // Apply responsive styles
          state.ui.viewMode === 'board'
            ? 'bg-background shadow-sm text-foreground'
            : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
        )}
      >
        <LayoutGrid className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-3.5 md:h-3.5 xl:w-4 xl:h-4 flex-shrink-0 task-header-icon" />
        <span className="font-medium text-xs sm:text-xs md:text-sm">Board</span>
      </Button>
    </div>
  );
}
