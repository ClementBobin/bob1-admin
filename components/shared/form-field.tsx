"use client";

import { useId, type ReactNode } from "react";
import { Field, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";

/** Label + control wrapper. The control receives a generated id through render props. */
export function FormField({
  label,
  full,
  className,
  children,
}: {
  label: string;
  full?: boolean;
  className?: string;
  children: (id: string) => ReactNode;
}) {
  const id = useId();
  return (
    <Field className={cn(full && "col-span-full", className)}>
      <FieldLabel htmlFor={id} className="text-[11px] font-bold text-muted-foreground">
        {label}
      </FieldLabel>
      {children(id)}
    </Field>
  );
}
