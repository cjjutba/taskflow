import { useEffect } from 'react';
import { useTask } from '../contexts/TaskContext';

export function useKeyboardShortcuts() {
  const { dispatch } = useTask();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target as HTMLElement)?.contentEditable === 'true'
      ) {
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
            // Focus search input
            const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
            if (searchInput) {
              searchInput.focus();
            }
          }
          break;

        case '/':
          if (!isModifierPressed) {
            preventDefault();
            // Focus search input
            const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
            if (searchInput) {
              searchInput.focus();
            }
          }
          break;

        // Clear filters (Escape)
        case 'escape':
          preventDefault();
          dispatch({ type: 'CLEAR_FILTERS' });
          // Close any open modals
          dispatch({ type: 'CLOSE_TASK_MODAL' });
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
