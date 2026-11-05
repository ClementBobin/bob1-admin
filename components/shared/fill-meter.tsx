import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function FillMeter({ value, total }: { value: number; total: number }) {
  const ratio = total === 0 ? 0 : Math.min(100, Math.round((value / total) * 100));
  const color =
    value === 0
      ? "[&>[data-slot=progress-indicator]]:bg-danger"
      : value === total
        ? "[&>[data-slot=progress-indicator]]:bg-green"
        : "[&>[data-slot=progress-indicator]]:bg-brand";
  return (
    <span className="flex items-center gap-2">
      <Progress value={ratio} className={cn("h-1.5 w-11 bg-muted", color)} />
      <b className="text-[11px] font-semibold text-muted-foreground">
        {value}/{total}
      </b>
    </span>
  );
}
