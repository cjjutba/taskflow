import React from 'react';
import { List, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTask } from '@/contexts/TaskContext';

export function ViewToggle() {
  const { state, dispatch } = useTask();

  const handleViewChange = (viewMode: 'list' | 'board') => {
    dispatch({ type: 'SET_VIEW_MODE', payload: viewMode });
    
    // Persist view preference in localStorage
    localStorage.setItem('taskManager.viewMode', viewMode);
  };

  return (
    <div className="flex items-center bg-muted rounded-lg p-1">
      <Button
        variant={state.ui.viewMode === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleViewChange('list')}
        className={`h-8 px-3 transition-all duration-200 ${
          state.ui.viewMode === 'list'
            ? 'bg-background shadow-sm text-foreground'
            : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
        }`}
      >
        <List className="w-4 h-4 mr-1.5" />
        List
      </Button>
      
      <Button
        variant={state.ui.viewMode === 'board' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleViewChange('board')}
        className={`h-8 px-3 transition-all duration-200 ${
          state.ui.viewMode === 'board'
            ? 'bg-background shadow-sm text-foreground'
            : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
        }`}
      >
        <LayoutGrid className="w-4 h-4 mr-1.5" />
        Board
      </Button>
    </div>
  );
}
