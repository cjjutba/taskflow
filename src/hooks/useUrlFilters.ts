import { useSearchParams } from 'react-router-dom';
import { useCallback, useMemo } from 'react';

export interface FilterState {
  search?: string;
  priority?: string;
  status?: string;
  project?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  view?: 'list' | 'board';
  task?: string; // Task ID for highlighting specific tasks
}

export function useUrlFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo((): FilterState => {
    return {
      search: searchParams.get('search') || undefined,
      priority: searchParams.get('priority') || undefined,
      status: searchParams.get('status') || undefined,
      project: searchParams.get('project') || undefined,
      sortBy: searchParams.get('sortBy') || undefined,
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || undefined,
      view: (searchParams.get('view') as 'list' | 'board') || undefined,
      task: searchParams.get('task') || undefined,
    };
  }, [searchParams]);

  const updateFilter = useCallback((key: keyof FilterState, value: string | undefined) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (value && value.trim() !== '') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const updateFilters = useCallback((newFilters: Partial<FilterState>) => {
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value.trim() !== '') {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const clearFilters = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  const clearFilter = useCallback((key: keyof FilterState) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete(key);
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  return {
    filters,
    updateFilter,
    updateFilters,
    clearFilters,
    clearFilter,
  };
}
