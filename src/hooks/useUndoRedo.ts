import { useState, useCallback, useRef } from 'react';

interface UndoRedoState<T> {
  past: T[];
  present: T;
  future: T[];
}

interface UndoRedoActions {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  set: (newState: any) => void;
  reset: (newState: any) => void;
}

export function useUndoRedo<T>(initialState: T): [T, UndoRedoActions] {
  const [state, setState] = useState<UndoRedoState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  const undo = useCallback(() => {
    setState((currentState) => {
      if (currentState.past.length === 0) return currentState;

      const previous = currentState.past[currentState.past.length - 1];
      const newPast = currentState.past.slice(0, currentState.past.length - 1);

      return {
        past: newPast,
        present: previous,
        future: [currentState.present, ...currentState.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState((currentState) => {
      if (currentState.future.length === 0) return currentState;

      const next = currentState.future[0];
      const newFuture = currentState.future.slice(1);

      return {
        past: [...currentState.past, currentState.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  const set = useCallback((newState: T) => {
    setState((currentState) => ({
      past: [...currentState.past, currentState.present],
      present: newState,
      future: [],
    }));
  }, []);

  const reset = useCallback((newState: T) => {
    setState({
      past: [],
      present: newState,
      future: [],
    });
  }, []);

  return [
    state.present,
    {
      canUndo,
      canRedo,
      undo,
      redo,
      set,
      reset,
    },
  ];
}

// Hook for keyboard shortcuts for undo/redo
export function useUndoRedoShortcuts(actions: UndoRedoActions) {
  const { undo, redo, canUndo, canRedo } = actions;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const { key, ctrlKey, metaKey, shiftKey } = event;
      const isModifierPressed = ctrlKey || metaKey;

      if (isModifierPressed && key.toLowerCase() === 'z') {
        event.preventDefault();
        
        if (shiftKey && canRedo) {
          redo();
        } else if (!shiftKey && canUndo) {
          undo();
        }
      }

      // Ctrl/Cmd + Y for redo (alternative)
      if (isModifierPressed && key.toLowerCase() === 'y' && canRedo) {
        event.preventDefault();
        redo();
      }
    },
    [undo, redo, canUndo, canRedo]
  );

  return handleKeyDown;
}
