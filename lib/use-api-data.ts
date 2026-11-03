"use client";

import { useCallback, useEffect, useRef, useState, type DependencyList } from "react";
import { USE_MOCK, errorMessage } from "@/lib/api";

/**
 * Loads data from the API when mock mode is disabled.
 *
 * In mock mode the hook simply exposes the provided fallback (the fixtures from
 * lib/data.ts) so the existing pages keep working without a backend. Pages can
 * still call setData to apply local edits.
 */
export function useApiData<T>(loader: () => Promise<T>, fallback: T, deps: DependencyList = []) {
  const loaderRef = useRef(loader);
  loaderRef.current = loader;
  const fallbackRef = useRef(fallback);
  fallbackRef.current = fallback;

  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState(!USE_MOCK);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (USE_MOCK) {
      setData(fallbackRef.current);
      setLoading(false);
      setError(null);
      return fallbackRef.current;
    }

    setLoading(true);
    try {
      const value = await loaderRef.current();
      setData(value);
      setError(null);
      return value;
    } catch (cause) {
      setError(errorMessage(cause));
      return fallbackRef.current;
    } finally {
      setLoading(false);
    }
    // The caller controls reloading through deps (search, tab, ...).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, setData, loading, error, reload };
}
