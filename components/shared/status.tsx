import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Tone } from "@/types";

const dots: Record<Tone, string> = {
  success: "bg-green",
  warning: "bg-brand",
  danger: "bg-danger",
  info: "bg-info",
  neutral: "bg-muted-foreground",
};

export function Status({
  tone = "neutral",
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Badge variant={tone} className={cn("gap-1.5 leading-none", className)}>
      <i className={cn("size-1.5 rounded-full", dots[tone])} />
      {children}
    </Badge>
  );
}
