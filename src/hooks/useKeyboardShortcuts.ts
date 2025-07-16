import { useEffect, useCallback } from 'react';
import { useTask } from '../contexts/TaskContext';

export interface SearchKeyboardHandlers {
  onSearchFocus?: () => void;
  onSearchEscape?: () => void;
  onSearchArrowUp?: () => void;
  onSearchArrowDown?: () => void;
  onSearchEnter?: () => void;
  onSearchTab?: () => void;
}

export function useKeyboardShortcuts(searchHandlers?: SearchKeyboardHandlers) {
  const { dispatch } = useTask();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isInputFocused = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.contentEditable === 'true';
      const isSearchInput = target.getAttribute('data-search-input') === 'true';

      // Don't trigger general shortcuts when typing in inputs (except search input for search-specific shortcuts)
      if (isInputFocused && !isSearchInput) {
        // Only allow global shortcuts like Cmd+K
        if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
          event.preventDefault();
          searchHandlers?.onSearchFocus?.();
        }
        return;
      }

      const { key, ctrlKey, metaKey, shiftKey } = event;
      const isModifierPressed = ctrlKey || metaKey;

      // Prevent default for our shortcuts
      const preventDefault = () => {
        event.preventDefault();
        event.stopPropagation();
      };

      switch (key.toLowerCase()) {
        // Create new task (Ctrl/Cmd + N)
        case 'n':
          if (isModifierPressed) {
            preventDefault();
            dispatch({ type: 'OPEN_TASK_MODAL' });
          }
          break;

        // Toggle view mode (V)
        case 'v':
          if (!isModifierPressed) {
            preventDefault();
            dispatch({ 
              type: 'SET_VIEW_MODE', 
              payload: dispatch.getState?.()?.ui.viewMode === 'list' ? 'board' : 'list' 
            });
          }
          break;

        // Search (Ctrl/Cmd + K or /)
        case 'k':
          if (isModifierPressed) {
            preventDefault();
            searchHandlers?.onSearchFocus?.();
          }
          break;

        case '/':
          if (!isModifierPressed) {
            preventDefault();
            searchHandlers?.onSearchFocus?.();
          }
          break;

        // Clear filters (Escape)
        case 'escape':
          if (isSearchInput) {
            preventDefault();
            searchHandlers?.onSearchEscape?.();
          } else {
            preventDefault();
            dispatch({ type: 'CLEAR_FILTERS' });
            // Close any open modals
            dispatch({ type: 'CLOSE_TASK_MODAL' });
          }
          break;

        // Search navigation (only when search input is focused)
        case 'arrowup':
          if (isSearchInput) {
            preventDefault();
            searchHandlers?.onSearchArrowUp?.();
          }
          break;

        case 'arrowdown':
          if (isSearchInput) {
            preventDefault();
            searchHandlers?.onSearchArrowDown?.();
          }
          break;

        case 'enter':
          if (isSearchInput) {
            preventDefault();
            searchHandlers?.onSearchEnter?.();
          }
          break;

        case 'tab':
          if (isSearchInput) {
            preventDefault();
            searchHandlers?.onSearchTab?.();
          }
          break;

        // Navigate views (1-4)
        case '1':
          if (!isModifierPressed) {
            preventDefault();
            dispatch({ type: 'SET_UI', payload: { key: 'activeView', value: 'today' } });
          }
          break;

        case '2':
          if (!isModifierPressed) {
            preventDefault();
            dispatch({ type: 'SET_UI', payload: { key: 'activeView', value: 'inbox' } });
          }
          break;

        case '3':
          if (!isModifierPressed) {
            preventDefault();
            dispatch({ type: 'SET_UI', payload: { key: 'activeView', value: 'all' } });
          }
          break;

        case '4':
          if (!isModifierPressed) {
            preventDefault();
            dispatch({ type: 'SET_UI', payload: { key: 'activeView', value: 'completed' } });
          }
          break;

        // Toggle sidebar (Ctrl/Cmd + B)
        case 'b':
          if (isModifierPressed) {
            preventDefault();
            dispatch({ 
              type: 'SET_UI', 
              payload: { 
                key: 'sidebarOpen', 
                value: !dispatch.getState?.()?.ui.sidebarOpen 
              } 
            });
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dispatch]);
}

// Hook to display keyboard shortcuts help
export function useKeyboardShortcutsHelp() {
  const shortcuts = [
    { key: 'Ctrl/Cmd + N', description: 'Create new task' },
    { key: 'V', description: 'Toggle view mode' },
    { key: 'Ctrl/Cmd + K or /', description: 'Focus search' },
    { key: 'Escape', description: 'Clear filters & close modals' },
    { key: '1-4', description: 'Navigate to views' },
    { key: 'Ctrl/Cmd + B', description: 'Toggle sidebar' },
  ];

  return shortcuts;
}

// Hook for detecting if user is on Mac (for showing correct shortcuts)
export function useIsMac() {
  return typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
}
