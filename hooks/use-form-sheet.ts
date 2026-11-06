"use client";

import { useCallback, useState } from "react";

/** Open/close + "currently edited row" state shared by every create/edit sheet. */
export function useFormSheet<T>() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);

  const openCreate = useCallback(() => {
    setEditing(null);
    setOpen(true);
  }, []);

  const openEdit = useCallback((row: T) => {
    setEditing(row);
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setEditing(null);
  }, []);

  return { open, editing, openCreate, openEdit, close, setOpen };
}
