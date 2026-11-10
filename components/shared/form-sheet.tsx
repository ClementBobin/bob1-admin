"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";

/** Right-hand side panel used by every create/edit form. */
export function FormSheet({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="right" className="w-full gap-0 sm:max-w-115">
        <SheetHeader className="min-h-19.5 justify-center border-b px-5 sm:px-6">
          <SheetTitle className="truncate font-display text-[18px] font-extrabold">{title}</SheetTitle>
          <SheetDescription className="text-[11px]">{subtitle}</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">{children}</div>
        {footer && (
          <SheetFooter className="min-h-18.5 flex-row flex-wrap items-center justify-end gap-2 border-t px-5 sm:px-6">
            {footer}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}

export function FormSheetFooter({
  onCancel,
  showCancel = true,
  submitLabel,
  form,
}: {
  onCancel: () => void;
  showCancel?: boolean;
  submitLabel: string;
  form?: string;
}) {
  return (
    <>
      {showCancel && (
        <Button type="button" variant="ghost" onClick={onCancel}>
          Annuler
        </Button>
      )}
      <Button type={form ? "submit" : "button"} form={form} className={!showCancel ? "w-full" : undefined}>
        {submitLabel}
      </Button>
    </>
  );
}
