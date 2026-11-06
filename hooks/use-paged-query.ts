"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { errorMessage } from "@/lib/api";
import type { Paged } from "@/types";

export const DEFAULT_PAGE_SIZE = 10;
const DEBOUNCE_MS = 300;

/**
 * Server-driven table state: sends the filters + `skip`/`take` through a QUERY request and exposes the
 * current page, the total and the paging controls. Changing a filter goes back to page 1; typing is debounced.
 */
export function usePagedQuery<T, F extends object>(
  loader: (params: F & { skip: number; take: number }) => Promise<Paged<T>>,
  filters: F,
  pageSize = DEFAULT_PAGE_SIZE,
) {
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const serialized = JSON.stringify(filters);
  const [settled, setSettled] = useState(serialized);
  const requestId = useRef(0);

  // Debounce filter changes (search typing) and go back to the first page.
  useEffect(() => {
    if (serialized === settled) return;
    const timer = setTimeout(() => {
      setSettled(serialized);
      setPage(1);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [serialized, settled]);

  const reload = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    try {
      const params = { ...(JSON.parse(settled) as F), skip: (page - 1) * pageSize, take: pageSize };
      const result = await loaderRef.current(params);
      if (id !== requestId.current) return;
      setItems(result.items);
      setTotal(result.total);
      setError(null);
      // The page may no longer exist (rows deleted): fall back to the last one.
      const lastPage = Math.max(1, Math.ceil(result.total / pageSize));
      if (page > lastPage) setPage(lastPage);
    } catch (cause) {
      if (id !== requestId.current) return;
      setError(errorMessage(cause));
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [settled, page, pageSize]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { items, setItems, total, page, setPage, pageSize, loading, error, reload };
}
