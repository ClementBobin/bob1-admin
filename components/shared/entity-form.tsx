import type { FormEvent, ReactNode } from "react";

/** <form> + two-column grid used by every create/edit sheet. Submit button lives in FormSheetFooter. */
export function EntityForm({
  id,
  onSubmit,
  children,
}: {
  id: string;
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
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">{children}</div>
    </form>
  );
}
