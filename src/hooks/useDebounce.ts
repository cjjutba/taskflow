import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook that debounces a value
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook that debounces a callback function
 * @param callback - The callback function to debounce
 * @param delay - The delay in milliseconds
 * @param deps - Dependencies array for the callback
 * @returns The debounced callback function
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const callbackRef = useRef<T>(callback);

  // Update callback ref when dependencies change
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback, ...deps]);

  const debouncedCallback = useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    }) as T,
    [delay]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

/**
 * Hook for debounced search functionality
 * @param searchFunction - The search function to debounce
 * @param delay - The delay in milliseconds (default: 300)
 * @returns Object with search function and loading state
 */
export function useDebouncedSearch<T, R>(
  searchFunction: (query: T) => Promise<R> | R,
  delay: number = 300
) {
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<R | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

  const search = useCallback(
    async (query: T) => {
      // Cancel previous search
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      setError(null);

      timeoutRef.current = setTimeout(async () => {
        if (signal.aborted) return;

        setIsSearching(true);

        try {
          const result = await searchFunction(query);
          
          if (!signal.aborted) {
            setResults(result);
          }
        } catch (err) {
          if (!signal.aborted) {
            setError(err instanceof Error ? err : new Error('Search failed'));
          }
        } finally {
          if (!signal.aborted) {
            setIsSearching(false);
          }
        }
      }, delay);
    },
    [searchFunction, delay]
  );

  const clearResults = useCallback(() => {
    setResults(null);
    setError(null);
    setIsSearching(false);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    search,
    clearResults,
    isSearching,
    results,
    error,
  };
}

/**
 * Hook for throttling a value (limits how often it can change)
 * @param value - The value to throttle
 * @param limit - The time limit in milliseconds
 * @returns The throttled value
 */
export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef<number>(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
}

/**
 * Hook that combines debouncing with immediate updates for certain conditions
 * Useful for search where you want immediate results for short queries but debounced for longer ones
 */
export function useSmartDebounce<T>(
  value: T,
  delay: number,
  immediateCondition?: (value: T) => boolean
): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Check if we should update immediately
    if (immediateCondition && immediateCondition(value)) {
      setDebouncedValue(value);
      return;
    }

    // Otherwise, debounce
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay, immediateCondition]);

  return debouncedValue;
}
