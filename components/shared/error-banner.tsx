export function ErrorBanner({ message }: { message?: string | null }) {
  if (!message) return null;
  return <div className="mb-4 rounded-xl bg-danger-soft px-4 py-3 text-[12px] font-medium text-danger">{message}</div>;
}
