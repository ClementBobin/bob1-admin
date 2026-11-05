"use client";

import { useMemo } from "react";
import { api } from "@/lib/api";
import { useApiData } from "@/hooks/use-api-data";
import type { LookupsDto } from "@/types";

const EMPTY: LookupsDto = {
  clubName: "",
  roles: [],
  divisionGenders: [],
  divisionCategories: [],
  matchStatuses: [],
  slotKinds: [],
  slotTemplates: [],
  pointCategories: [],
  notificationTypes: [],
};

let cache: Promise<LookupsDto> | null = null;

/** Lookups change only with an API release: fetch once per page load and share it. */
function loadLookups() {
  cache ??= api.lookups.get().catch((cause) => {
    cache = null;
    throw cause;
  });
  return cache;
}

export function useLookups() {
  const { data, loading, error } = useApiData<LookupsDto>(loadLookups, EMPTY);
  return useMemo(() => {
    const pointCategoryLabels: Record<string, string> = Object.fromEntries(
      data.pointCategories.map((item) => [item.value, item.label]),
    );
    return {
      ...data,
      loading,
      error,
      pointCategoryKeys: data.pointCategories.map((item) => item.value),
      pointCategoryLabel: (key: string) => pointCategoryLabels[key] ?? key,
      notificationTypeNames: data.notificationTypes.map((item) => item.value),
    };
  }, [data, loading, error]);
}
