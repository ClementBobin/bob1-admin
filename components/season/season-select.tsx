"use client";

import { OptionSelect } from "@/components/shared/option-select";
import { useSeason } from "@/components/season/season-provider";

/** Header selector: the season every list is showing. */
export function SeasonSelect() {
  const { seasons, season, current, setSeason } = useSeason();
  if (seasons.length === 0) return null;
  const options = seasons.map((s) => s.label);
  return (
    <div id="tour-season" className="hidden items-center gap-2 sm:flex">
      <OptionSelect
        aria-label="Saison"
        value={season}
        onValueChange={setSeason}
        options={options}
        searchPlaceholder="Saison…"
        className="h-10 w-[150px] rounded-xl"
      />
      {season !== current && (
        <span className="rounded-full bg-warning-soft px-2 py-1 text-[10px] font-bold text-warning">Lecture seule</span>
      )}
    </div>
  );
}
