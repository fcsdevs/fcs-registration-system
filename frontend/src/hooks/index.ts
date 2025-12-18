/**
 * Custom React Hooks
 * Common utilities for queries, forms, and offline sync
 */

import { useQuery, useMutation, useInfiniteQuery } from "@tanstack/react-query";
import { useState, useCallback, useEffect } from "react";
import { api } from "@/lib/api/client";

/**
 * Generic fetch hook with caching
 */
export function useFetch<T>(
  endpoint: string | null,
  options?: { enabled?: boolean; staleTime?: number; gcTime?: number }
) {
  return useQuery({
    queryKey: [endpoint],
    queryFn: () => api.get<T>(endpoint!),
    enabled: !!endpoint && options?.enabled !== false,
    staleTime: options?.staleTime ?? 1000 * 60 * 5, // 5 minutes
    gcTime: options?.gcTime ?? 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Generic mutation hook
 */
export function useCreateMutation<TData, TVariables>(endpoint: string) {
  return useMutation({
    mutationFn: (variables: TVariables) => api.post<TData>(endpoint, variables),
  });
}

export function useUpdateMutation<TData, TVariables>(endpoint: string) {
  return useMutation({
    mutationFn: (variables: TVariables) => api.put<TData>(endpoint, variables),
  });
}

export function useDeleteMutation<TVariables>(endpoint: string) {
  return useMutation({
    mutationFn: (variables: TVariables) => api.delete(endpoint),
  });
}

/**
 * Infinite scroll / pagination hook
 */
export function usePaginatedFetch<T>(
  endpoint: string,
  pageSize: number = 20
) {
  return useInfiniteQuery({
    queryKey: [endpoint],
    queryFn: ({ pageParam = 0 }) =>
      api.get<any>(
        `${endpoint}?page=${pageParam}&pageSize=${pageSize}`
      ),
    getNextPageParam: (lastPage) =>
      lastPage.pagination?.hasMore ? lastPage.pagination.page + 1 : undefined,
    initialPageParam: 0,
  });
}

/**
 * Debounced search hook
 */
export function useDebouncedSearch<T>(
  searchFn: (query: string) => Promise<T[]>,
  delay: number = 300
) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<T[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const data = await searchFn(query);
        setResults(data);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [query, searchFn, delay]);

  return { query, setQuery, results, isSearching };
}

/**
 * Local storage hook with persistence
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === "undefined") return initialValue;
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}

/**
 * Online/Offline status hook
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

/**
 * Debounced value hook
 */
export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Viewport size hook
 */
export function useViewportSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateSize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", updateSize);
    updateSize();

    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return size;
}

/**
 * Prevent body scroll hook
 */
export function usePreventScroll(isOpen: boolean) {
  useEffect(() => {
    if (typeof document === "undefined") return;

    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);
}
