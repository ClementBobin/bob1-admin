import type { FormEvent, ReactNode } from "react";

/** <form> + two-column grid used by every create/edit sheet. Submit button lives in FormSheetFooter. */
export function EntityForm({
  id,
  onSubmit,
  single,
  children,
}: {
  id: string;
  single?: boolean;
  onSubmit: () => void;
  children: ReactNode;
}) {
  return (
    <form
      id={id}
      onSubmit={(event: FormEvent) => {
        event.preventDefault();
        onSubmit();
      }}
      className="flex flex-col gap-4"
    >
      <div className={single ? "grid grid-cols-1 gap-3.5" : "grid grid-cols-1 gap-3.5 sm:grid-cols-2"}>{children}</div>
    </form>
  );
}
