"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fr } from "react-day-picker/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

const matchDays: Record<Tone, Date[]> = {
  success: [new Date(2025, 4, 14), new Date(2025, 4, 24), new Date(2025, 4, 31)],
  warning: [new Date(2025, 4, 10), new Date(2025, 4, 17)],
  danger: [new Date(2025, 4, 28)],
  info: [new Date(2025, 4, 3), new Date(2025, 4, 20)],
  neutral: [new Date(2025, 4, 6)],
};

const today = new Date(2025, 4, 24);

const dot =
  "after:pointer-events-none after:absolute after:bottom-1 after:left-1/2 after:size-1 after:-translate-x-1/2 after:rounded-full";
const dotClasses: Record<Tone, string> = {
  success: `${dot} after:bg-green`,
  warning: `${dot} after:bg-brand`,
  danger: `${dot} after:bg-danger`,
  info: `${dot} after:bg-info`,
  neutral: `${dot} after:bg-muted-foreground`,
};

export default function MiniCalendar() {
  const [month, setMonth] = useState(today);

  const scheduled = Object.values(matchDays)
    .flat()
    .filter((date) => date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth()).length;

  return (
    <Card className="gap-0 py-0 shadow-soft">
      <CardHeader className="min-h-[66px] border-b px-5 py-4">
        <CardTitle className="font-display text-[15px] font-extrabold capitalize">
          {month.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
        </CardTitle>
        <CardDescription className="text-[11px]">
          {scheduled > 0 ? `${scheduled} jours avec match` : "Aucun match programmé"}
        </CardDescription>
        <CardAction className="flex gap-1.5">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Mois précédent"
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Mois suivant"
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
          >
            <ChevronRight />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 py-2">
        <Calendar
          locale={fr}
          weekStartsOn={1}
          month={month}
          onMonthChange={setMonth}
          mode="single"
          selected={today}
          modifiers={matchDays}
          modifiersClassNames={dotClasses}
          className="w-full [--cell-size:--spacing(9)]"
          classNames={{ root: "w-full", month_caption: "hidden", nav: "hidden" }}
        />
      </CardContent>
    </Card>
  );
}
