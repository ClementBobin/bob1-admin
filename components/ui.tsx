"use client";

import {
  useEffect,
  useState,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import Link from "next/link";
import { ChevronDown, ChevronLeft, ChevronRight, X, type LucideIcon } from "lucide-react";
import { cn, formatCount, initials } from "@/lib/utils";
import type { Tone } from "@/lib/data";

type ButtonVariant = "primary" | "secondary" | "tonal" | "outline" | "text" | "icon";
type ButtonSize = "sm" | "md" | "lg";

export function buttonStyles(variant: ButtonVariant = "primary", size: ButtonSize = "md") {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-bold whitespace-nowrap transition duration-150",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:pointer-events-none disabled:opacity-45",
    size === "sm" && "h-9 px-3.5 text-[12px]",
    size === "md" && "h-10 px-4 text-[12.5px]",
    size === "lg" && "h-11 px-5 text-[13px]",
    variant === "primary" &&
      "bg-brand text-brand-foreground shadow-[0_6px_16px_color-mix(in_srgb,var(--brand)_25%,transparent)] hover:-translate-y-px hover:brightness-[0.98]",
    variant === "secondary" && "bg-green text-brand-foreground hover:-translate-y-px hover:brightness-105",
    variant === "tonal" && "bg-mint text-mint-foreground hover:brightness-[0.98]",
    variant === "outline" && "border border-line bg-card text-ink hover:bg-muted",
    variant === "text" && "text-brand hover:bg-brand-soft",
    variant === "icon" && "size-10 shrink-0 p-0 text-ink hover:bg-muted"
  );
}

type CommonButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  children?: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  icon: IconComponent,
  children,
  className,
  type = "button",
  ...props
}: CommonButtonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={cn(buttonStyles(variant, size), className)} {...props}>
      {IconComponent && <IconComponent size={size === "sm" ? 15 : 17} aria-hidden="true" />}
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  icon: IconComponent,
  children,
  className,
  ...props
}: CommonButtonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return (
    <Link className={cn(buttonStyles(variant, size), className)} {...props}>
      {IconComponent && <IconComponent size={size === "sm" ? 15 : 17} aria-hidden="true" />}
      {children}
    </Link>
  );
}

const avatarTones: Record<string, string> = {
  orange: "bg-brand",
  green: "bg-green",
  purple: "bg-[#7453a6]",
  blue: "bg-info",
};

export function Avatar({
  name,
  tone = "green",
  size = "md",
  className,
}: {
  name: string;
  tone?: "orange" | "green" | "purple" | "blue";
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-extrabold text-white ring-2 ring-card",
        size === "xs" && "size-6 text-[9px]",
        size === "sm" && "size-8 text-[10px]",
        size === "md" && "size-9 text-[11px]",
        size === "lg" && "size-11 text-[13px]",
        avatarTones[tone],
        className
      )}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}

const statusTones: Record<Tone, { wrap: string; dot: string }> = {
  success: { wrap: "bg-mint text-mint-foreground", dot: "bg-green" },
  warning: { wrap: "bg-brand-soft text-[#9a4b00] dark:text-[#ffc48f]", dot: "bg-brand" },
  danger: { wrap: "bg-danger-soft text-danger", dot: "bg-danger" },
  info: { wrap: "bg-info-soft text-info", dot: "bg-info" },
  neutral: { wrap: "bg-muted text-soft", dot: "bg-soft" },
};

export function Status({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  const style = statusTones[tone];
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold leading-none",
        style.wrap
      )}
    >
      <i className={cn("size-1.5 rounded-full", style.dot)} />
      {children}
    </span>
  );
}

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
  action?: { label: string; onClick: () => void; icon?: LucideIcon };
  secondaryAction?: { label: string; onClick: () => void; icon?: LucideIcon };
  id?: string;
}) {
  const ActionIcon = action?.icon;
  return (
    <div
      id={id}
      className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
    >
      <div className="min-w-0">
        <span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-brand">{eyebrow}</span>
        <h1 className="mt-1.5 font-display text-[28px] font-extrabold leading-tight tracking-[-0.035em] sm:text-[32px]">
          {title}
        </h1>
        <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-soft">{description}</p>
      </div>
      {(action || secondaryAction) && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick} icon={secondaryAction.icon}>
              {secondaryAction.label}
            </Button>
          )}
          {action && (
            <Button onClick={action.onClick} icon={ActionIcon ?? undefined}>
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export function Card({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("rounded-[17px] border border-line bg-card shadow-soft", className)}>
      {children}
    </section>
  );
}

export function CardHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-[66px] items-center justify-between gap-3 border-b border-line px-5 py-4">
      <div className="flex min-w-0 flex-col">
        <strong className="font-display text-[15px] font-extrabold">{title}</strong>
        {subtitle && <small className="mt-1 text-[11px] text-soft">{subtitle}</small>}
      </div>
      {action}
    </div>
  );
}

export function Filters({
  search,
  onSearch,
  searchPlaceholder = "Rechercher…",
  selects,
  onReset,
  id,
}: {
  search: string;
  onSearch: (value: string) => void;
  searchPlaceholder?: string;
  selects?: Array<{ label: string; value: string; options: string[]; onChange: (value: string) => void }>;
  onReset?: () => void;
  id?: string;
}) {
  return (
    <div
      id={id}
      className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-card p-2"
    >
      <label className="flex h-10 w-full items-center gap-2.5 rounded-[10px] border border-line bg-canvas px-3 text-soft sm:w-[280px]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="size-4 shrink-0" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder={searchPlaceholder}
          className="h-full w-full bg-transparent text-[12.5px] text-ink outline-none placeholder:text-soft [&::-webkit-search-cancel-button]:hidden"
          aria-label={searchPlaceholder}
        />
      </label>
      {selects?.map((select) => (
        <label
          key={select.label}
          className="relative flex h-10 items-center rounded-[10px] border border-line bg-card text-ink"
        >
          <span className="sr-only">{select.label}</span>
          <select
            value={select.value}
            onChange={(event) => select.onChange(event.target.value)}
            className="h-full cursor-pointer appearance-none bg-transparent pl-3 pr-8 text-[12px] font-medium outline-none"
          >
            {select.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-2.5 text-soft" />
        </label>
      ))}
      {onReset && (
        <button
          onClick={onReset}
          className="ml-auto h-10 rounded-[10px] px-2.5 text-[12px] font-bold text-brand transition hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Réinitialiser
        </button>
      )}
    </div>
  );
}

export type Column<T> = {
  key: string;
  label: string;
  render: (row: T, index: number) => ReactNode;
  align?: "left" | "right";
};

export function DataTable<T>({
  columns,
  rows,
  grid,
  rowKey,
  pageSize = 6,
  minWidth = 920,
  rowClassName,
  emptyMessage = "Aucun résultat ne correspond à votre recherche.",
  id,
}: {
  columns: Column<T>[];
  rows: T[];
  grid: string;
  rowKey: (row: T, index: number) => string;
  pageSize?: number;
  minWidth?: number;
  rowClassName?: (row: T, index: number) => string | undefined;
  emptyMessage?: string;
  id?: string;
}) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visible = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div id={id} className="overflow-hidden rounded-2xl border border-line bg-card shadow-soft">
      <div className="overflow-x-auto">
        <div style={{ minWidth }}>
          <div
            role="row"
            className="grid h-11 items-center gap-3 bg-muted/70 px-4 text-[10px] font-extrabold uppercase tracking-[0.06em] text-soft"
            style={{ gridTemplateColumns: grid }}
          >
            {columns.map((column) => (
              <span key={column.key} role="columnheader" className={column.align === "right" ? "text-right" : ""}>
                {column.label}
              </span>
            ))}
          </div>
          <div role="rowgroup">
            {visible.length === 0 && (
              <div className="flex min-h-[180px] flex-col items-center justify-center gap-2 p-8 text-center">
                <span className="grid size-11 place-items-center rounded-xl bg-muted text-soft">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="size-5" aria-hidden="true">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" strokeLinecap="round" />
                  </svg>
                </span>
                <strong className="text-[13px]">Aucun résultat</strong>
                <span className="max-w-xs text-[12px] text-soft">{emptyMessage}</span>
              </div>
            )}
            {visible.map((row, index) => (
              <div
                key={rowKey(row, index)}
                role="row"
                className={cn(
                  "grid min-h-[64px] items-center gap-3 border-b border-line px-4 py-2.5 text-[12.5px] last:border-b-0",
                  rowClassName?.(row, index)
                )}
                style={{ gridTemplateColumns: grid }}
              >
                {columns.map((column) => (
                  <div
                    key={column.key}
                    role="cell"
                    className={cn("min-w-0", column.align === "right" && "text-right")}
                  >
                    {column.render(row, (currentPage - 1) * pageSize + index)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex min-h-[54px] flex-wrap items-center justify-between gap-3 border-t border-line px-4 text-[11px] text-soft">
        <span>{formatCount(rows.length, currentPage, pageSize)}</span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            aria-label="Page précédente"
            className="grid size-8 place-items-center rounded-lg border border-line bg-card text-soft transition hover:bg-muted disabled:opacity-40"
          >
            <ChevronLeft size={15} />
          </button>
          {Array.from({ length: pageCount }, (_, index) => index + 1)
            .filter((item) => item === 1 || item === pageCount || Math.abs(item - currentPage) <= 1)
            .map((item, index, list) => (
              <span key={item} className="flex items-center gap-1.5">
                {index > 0 && item - list[index - 1] > 1 && <span className="px-0.5 text-soft">…</span>}
                <button
                  onClick={() => setPage(item)}
                  aria-current={item === currentPage ? "page" : undefined}
                  className={cn(
                    "grid size-8 place-items-center rounded-lg border text-[11px] font-semibold transition",
                    item === currentPage
                      ? "border-transparent bg-brand text-brand-foreground"
                      : "border-line bg-card text-soft hover:bg-muted"
                  )}
                >
                  {item}
                </button>
              </span>
            ))}
          <button
            onClick={() => setPage(Math.min(pageCount, currentPage + 1))}
            disabled={currentPage === pageCount}
            aria-label="Page suivante"
            className="grid size-8 place-items-center rounded-lg border border-line bg-card text-soft transition hover:bg-muted disabled:opacity-40"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function FillMeter({
  value,
  total,
  tone,
}: {
  value: number;
  total: number;
  tone?: "green" | "orange" | "danger";
}) {
  const ratio = total === 0 ? 0 : Math.min(100, Math.round((value / total) * 100));
  const resolved = tone ?? (value === 0 ? "danger" : value === total ? "green" : "orange");
  return (
    <span className="flex items-center gap-2">
      <span className="h-1.5 w-11 overflow-hidden rounded-full bg-muted">
        <i
          className={cn(
            "block h-full rounded-full",
            resolved === "green" && "bg-green",
            resolved === "orange" && "bg-brand",
            resolved === "danger" && "bg-danger"
          )}
          style={{ width: `${ratio}%` }}
        />
      </span>
      <b className="text-[11px] font-semibold text-soft">
        {value}/{total}
      </b>
    </span>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full p-[3px] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
        checked ? "bg-green" : "bg-muted"
      )}
    >
      <span
        className={cn(
          "block size-[18px] rounded-full bg-card shadow-sm transition-transform",
          checked && "translate-x-5"
        )}
      />
    </button>
  );
}

export function FormField({
  label,
  hint,
  wide,
  children,
}: {
  label: string;
  hint?: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <label className={cn("flex flex-col gap-1.5", wide && "col-span-full")}>
      <span className="ml-0.5 text-[11px] font-bold text-soft">{label}</span>
      {children}
      {hint && <small className="ml-0.5 text-[10px] text-soft">{hint}</small>}
    </label>
  );
}

const inputStyles =
  "h-11 w-full rounded-[10px] border border-line bg-card px-3 text-[13px] text-ink outline-none transition placeholder:text-soft focus:border-brand focus:ring-2 focus:ring-brand/15";

export function TextInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputStyles, className)} {...props} />;
}

export function SelectInput({
  options,
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { options: string[] }) {
  return (
    <span className="relative block">
      <select className={cn(inputStyles, "cursor-pointer appearance-none pr-9", className)} {...props}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-soft" />
    </span>
  );
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(inputStyles, "h-auto min-h-[110px] resize-y py-2.5 leading-relaxed", className)}
      {...props}
    />
  );
}

export function Drawer({
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
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        className="animate-fade absolute inset-0 cursor-default bg-[rgba(8,5,3,0.42)] backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Fermer le panneau"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="animate-drawer absolute inset-y-0 right-0 flex w-[min(460px,100vw)] flex-col bg-card shadow-float"
      >
        <div className="flex min-h-[78px] items-center justify-between gap-4 border-b border-line px-5 sm:px-6">
          <div className="flex min-w-0 flex-col">
            <strong className="truncate font-display text-[18px] font-extrabold">{title}</strong>
            <small className="mt-1 text-[11px] text-soft">{subtitle}</small>
          </div>
          <Button variant="icon" onClick={onClose} aria-label="Fermer">
            <X size={19} />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">{children}</div>
        {footer && (
          <div className="flex min-h-[74px] items-center justify-end gap-2 border-t border-line px-5 sm:px-6">
            {footer}
          </div>
        )}
      </aside>
    </div>
  );
}

export function DrawerFooter({
  onCancel,
  submitLabel,
  form,
}: {
  onCancel: () => void;
  submitLabel: string;
  form?: string;
}) {
  return (
    <>
      <Button variant="text" onClick={onCancel}>
        Annuler
      </Button>
      <Button type={form ? "submit" : "button"} form={form}>
        {submitLabel}
      </Button>
    </>
  );
}

export function InfoBanner({
  tone = "success",
  icon,
  title,
  description,
}: {
  tone?: "success" | "warning" | "danger";
  icon?: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div
      className={cn(
        "mb-4 flex items-start gap-3 rounded-xl px-4 py-3.5",
        tone === "success" && "bg-mint text-mint-foreground",
        tone === "warning" && "bg-brand-soft text-[#8e4200] dark:text-[#ffc48f]",
        tone === "danger" && "bg-danger-soft text-danger"
      )}
    >
      {icon && <span className="mt-0.5 shrink-0">{icon}</span>}
      <span className="flex flex-col">
        <strong className="text-[12px]">{title}</strong>
        <small className="mt-0.5 text-[11px] opacity-80">{description}</small>
      </span>
    </div>
  );
}
