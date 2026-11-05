"use client";

import { useCallback, useEffect, useRef, useState, type DependencyList } from "react";
import { errorMessage } from "@/lib/api";

/**
 * Loads data from the API when mock mode is disabled.
 *
 * In mock mode the hook simply exposes the provided fallback (the fixtures from
 * lib/data.ts) so the existing pages keep working without a backend. Pages can
 * still call setData to apply local edits.
 */
export function useApiData<T>(loader: () => Promise<T>, depsOrInitialData: DependencyList | T = []) {
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  const deps = Array.isArray(depsOrInitialData) ? depsOrInitialData : [];
  const initialData = (Array.isArray(depsOrInitialData) ? [] : depsOrInitialData) as T;
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const value = await loaderRef.current();
      setData(value);
      setError(null);
      return value;
    } catch (cause) {
      setError(errorMessage(cause));
      // return type null or []
      return null as unknown as T;
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
