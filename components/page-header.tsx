import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type HeaderAction = { label: string; onClick: () => void; icon?: LucideIcon };

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  secondaryAction,
  id,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: HeaderAction;
  secondaryAction?: HeaderAction;
  id?: string;
}) {
  const ActionIcon = action?.icon;
  const SecondaryIcon = secondaryAction?.icon;
  return (
    <div id={id} className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-brand">{eyebrow}</span>
        <h1 className="mt-1.5 font-display text-[28px] font-extrabold leading-tight tracking-[-0.035em] sm:text-[32px]">
          {title}
        </h1>
        <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">{description}</p>
      </div>
      {(action || secondaryAction) && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {SecondaryIcon && <SecondaryIcon />}
              {secondaryAction.label}
            </Button>
          )}
          {action && (
            <Button onClick={action.onClick}>
              {ActionIcon && <ActionIcon />}
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export function CardHeading({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <CardHeader className="min-h-[66px] items-center gap-1 border-b px-5 py-4 pb-4!">
      <CardTitle className="font-display text-[15px] font-extrabold leading-snug">{title}</CardTitle>
      {subtitle && <CardDescription className="text-[11px]">{subtitle}</CardDescription>}
      {action && <CardAction className="row-span-2 self-center">{action}</CardAction>}
    </CardHeader>
  );
}
