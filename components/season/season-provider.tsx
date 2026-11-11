"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "@/lib/api";
import type { SeasonDto } from "@/types";

type SeasonContextValue = {
  seasons: SeasonDto[];
  /** Label of the season being browsed ("2026-2027"); "" until the list is loaded. */
  season: string;
  /** Label of the running season. */
  current: string;
  /** Past seasons are read-only. */
  isCurrent: boolean;
  setSeason: (label: string) => void;
};

const STORAGE_KEY = "bob1.season";
const SeasonContext = createContext<SeasonContextValue | null>(null);

export function SeasonProvider({ children }: { children: ReactNode }) {
  const [seasons, setSeasons] = useState<SeasonDto[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    api.seasons
      .list()
      .then((list) => {
        setSeasons(list);
        let saved: string | null = null;
        try {
          saved = localStorage.getItem(STORAGE_KEY);
        } catch {
          /* storage unavailable */
        }
        setSelected(list.some((s) => s.label === saved) ? saved : null);
      })
      .catch(() => setSeasons([]));
  }, []);

  const current = seasons.find((s) => s.isCurrent)?.label ?? "";
  const season = selected ?? current;

  const setSeason = useCallback((label: string) => {
    setSelected(label);
    try {
      localStorage.setItem(STORAGE_KEY, label);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const value = useMemo(
    () => ({ seasons, season, current, isCurrent: season === current, setSeason }),
    [seasons, season, current, setSeason],
  );
  return <SeasonContext.Provider value={value}>{children}</SeasonContext.Provider>;
}

export function useSeason() {
  const ctx = useContext(SeasonContext);
  if (!ctx) throw new Error("useSeason must be used inside SeasonProvider");
  return ctx;
}
