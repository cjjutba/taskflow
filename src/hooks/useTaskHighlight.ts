import React, { useEffect, useCallback } from 'react';
import { useTask } from '../contexts/TaskContext';
import { useUrlFilters } from './useUrlFilters';
import { useToast } from '../components/ui/use-toast';
import { urlService } from '../services/urlService';
import { ToastAction } from '../components/ui/toast';

export interface TaskHighlightResult {
  highlightedTaskId: string | null;
  isTaskHighlighted: (taskId: string) => boolean;
  highlightTask: (taskId: string) => void;
  clearHighlight: () => void;
  scrollToTask: (taskId: string, retries?: number) => void;
  showTaskNotFound: (taskId: string, currentPage: string) => void;
}

export function useTaskHighlight(): TaskHighlightResult {
  const { state, dispatch } = useTask();
  const { filters, updateFilter } = useUrlFilters();
  const { toast } = useToast();

  // Get highlighted task ID from URL or context
  const highlightedTaskId = filters.task || state.ui.highlightedTaskId;

  // Check if a specific task is highlighted
  const isTaskHighlighted = useCallback((taskId: string): boolean => {
    return highlightedTaskId === taskId;
  }, [highlightedTaskId]);

  // Highlight a task (updates both URL and context)
  const highlightTask = useCallback((taskId: string) => {
    // Update URL parameter
    updateFilter('task', taskId);
    
    // Update context state
    dispatch({
      type: 'HIGHLIGHT_TASK',
      payload: { taskId }
    });
  }, [updateFilter, dispatch]);

  // Clear task highlighting
  const clearHighlight = useCallback(() => {
    // Clear URL parameter
    updateFilter('task', undefined);
    
    // Clear context state
    dispatch({ type: 'CLEAR_HIGHLIGHT' });
  }, [updateFilter, dispatch]);

  // Scroll to highlighted task with enhanced functionality
  const scrollToTask = useCallback((taskId: string, retries = 3) => {
    // First validate that the task exists in our data
    const taskExists = state.tasks.find(t => t.id === taskId);
    if (!taskExists) {
      // Task doesn't exist in our data, don't attempt to scroll
      return;
    }

    const attemptScroll = (attempt: number) => {
      const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);

      if (taskElement) {
        // Add a subtle flash effect before scrolling
        taskElement.classList.add('animate-pulse');
        setTimeout(() => {
          taskElement.classList.remove('animate-pulse');
        }, 1000);

        // Scroll to the element
        taskElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });

        // Focus the element for accessibility
        if (taskElement instanceof HTMLElement) {
          taskElement.focus({ preventScroll: true });
        }
      } else if (attempt < retries) {
        // Retry if element not found (might still be rendering)
        setTimeout(() => attemptScroll(attempt + 1), 200 * attempt);
      } else {
        // Silently fail if task element is not found - this can happen during navigation
        // or when the task is not currently visible on the page
        return;
      }
    };

    // Initial delay to ensure DOM is updated
    setTimeout(() => attemptScroll(1), 100);
  }, [state.tasks]);

  // Show task not found notification
  const showTaskNotFound = useCallback((taskId: string, currentPage: string) => {
    const task = state.tasks.find(t => t.id === taskId);

    if (task) {
      // Task exists but not on current page - suggest correct page
      const correctUrl = urlService.getTaskUrl(task);
      const correctPageName = getPageNameFromUrl(correctUrl);

      toast({
        title: "Task not found on this page",
        description: `"${task.title}" is located on the ${correctPageName} page.`,
        duration: 5000,
        action: React.createElement(ToastAction, {
          altText: "Go to task",
          onClick: () => {
            window.location.href = correctUrl;
          }
        }, "Go to task")
      });
    } else {
      // Task doesn't exist at all
      toast({
        title: "Task not found",
        description: "This task may have been deleted or moved.",
        variant: "destructive",
        duration: 3000,
      });
    }

    // Clear the invalid highlight
    clearHighlight();
  }, [state.tasks, toast, clearHighlight]);

  // Helper function to get page name from URL
  const getPageNameFromUrl = (url: string): string => {
    if (url === '/') return 'Today';
    if (url.includes('/inbox')) return 'Inbox';
    if (url.includes('/all-tasks')) return 'All Tasks';
    if (url.includes('/completed')) return 'Completed';
    if (url.includes('/project/')) return 'Project';
    return 'Unknown';
  };

  // Sync URL parameter with context state on mount/change
  useEffect(() => {
    if (filters.task && filters.task !== state.ui.highlightedTaskId) {
      // Validate that the task exists before processing
      const taskExists = state.tasks.find(t => t.id === filters.task);

      if (taskExists) {
        // URL has valid task parameter, update context
        dispatch({
          type: 'HIGHLIGHT_TASK',
          payload: { taskId: filters.task }
        });

        // Auto-scroll to the task
        scrollToTask(filters.task);

        // Auto-clear highlight after 3 seconds
        const timer = setTimeout(() => {
          clearHighlight();
        }, 3000);

        return () => clearTimeout(timer);
      } else {
        // Invalid task ID in URL, clear it
        clearHighlight();
      }
    }
  }, [filters.task, state.ui.highlightedTaskId, state.tasks, dispatch, scrollToTask, clearHighlight]);

  return {
    highlightedTaskId,
    isTaskHighlighted,
    highlightTask,
    clearHighlight,
    scrollToTask,
    showTaskNotFound,
  };
}
