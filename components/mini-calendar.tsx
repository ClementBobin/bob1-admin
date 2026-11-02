"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const dots: Record<string, "success" | "warning" | "danger" | "info" | "neutral"> = {
  "2025-5-3": "info",
  "2025-5-6": "neutral",
  "2025-5-10": "warning",
  "2025-5-14": "success",
  "2025-5-17": "warning",
  "2025-5-20": "info",
  "2025-5-24": "success",
  "2025-5-28": "danger",
  "2025-5-31": "success",
};

const dotTone = {
  success: "bg-green",
  warning: "bg-brand",
  danger: "bg-danger",
  info: "bg-info",
  neutral: "bg-soft",
};

export default function MiniCalendar() {
  const [month, setMonth] = useState(new Date(2025, 4, 1));

  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1);
  const offset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const daysInPrevious = new Date(year, monthIndex, 0).getDate();
  const cells = Array.from({ length: 42 }, (_, index) => {
    const dayNumber = index - offset + 1;
    if (dayNumber < 1) {
      return { day: daysInPrevious + dayNumber, outside: true, key: `prev-${index}` };
    }
    if (dayNumber > daysInMonth) {
      return { day: dayNumber - daysInMonth, outside: true, key: `next-${index}` };
    }
    return { day: dayNumber, outside: false, key: `current-${index}` };
  });

  const label = month.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  const scheduled = Object.keys(dots).filter((key) => {
    const [keyYear, keyMonth] = key.split("-").map(Number);
    return keyYear === year && keyMonth === monthIndex + 1;
  }).length;

  return (
    <section className="rounded-[17px] border border-line bg-card shadow-soft">
      <div className="flex min-h-[66px] items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div className="flex flex-col">
          <strong className="font-display text-[15px] font-extrabold capitalize">{label}</strong>
          <small className="mt-1 text-[11px] capitalize text-soft">
            {scheduled > 0 ? `${scheduled} jours avec match` : "Aucun match programmé"}
          </small>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => setMonth(new Date(year, monthIndex - 1, 1))}
            aria-label="Mois précédent"
            className="grid size-8 place-items-center rounded-lg border border-line bg-card text-ink transition hover:bg-muted"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            onClick={() => setMonth(new Date(year, monthIndex + 1, 1))}
            aria-label="Mois suivant"
            className="grid size-8 place-items-center rounded-lg border border-line bg-card text-ink transition hover:bg-muted"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 px-4 pt-3">
        {["L", "M", "M", "J", "V", "S", "D"].map((day, index) => (
          <b key={index} className="text-center text-[10px] font-bold text-soft">
            {day}
          </b>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5 px-4 pb-4 pt-1.5">
        {cells.map((cell) => {
          const key = `${year}-${monthIndex + 1}-${cell.day}`;
          const dot = !cell.outside ? dots[key] : undefined;
          const active = key === "2025-5-24";
          return (
            <span
              key={cell.key}
              className={cn(
                "relative grid h-9 place-items-center rounded-[10px] text-[11.5px]",
                cell.outside && "opacity-30",
                active && "bg-brand font-bold text-brand-foreground"
              )}
            >
              {cell.day}
              {dot && (
                <i
                  className={cn(
                    "absolute bottom-1 size-1 rounded-full",
                    active ? "bg-brand-foreground" : dotTone[dot]
                  )}
                />
              )}
            </span>
          );
        })}
      </div>
    </section>
  );
}
