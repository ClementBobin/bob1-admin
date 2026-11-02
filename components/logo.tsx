import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  LayoutDashboard,
  MapPin,
  Menu,
  Minus,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Trophy,
  UserRound,
  Users,
  UsersRound,
  X,
  type LucideIcon,
} from "lucide-react";

export type IconName =
  | "arrow-left"
  | "calendar"
  | "check"
  | "chevron-down"
  | "chevron-left"
  | "chevron-right"
  | "clock"
  | "dashboard"
  | "download"
  | "location"
  | "map"
  | "menu"
  | "minus"
  | "plus"
  | "search"
  | "shield"
  | "sliders"
  | "trophy"
  | "user"
  | "users"
  | "users-round"
  | "x";

const icons: Record<IconName, LucideIcon> = {
  "arrow-left": ArrowLeft,
  calendar: CalendarDays,
  check: Check,
  "chevron-down": ChevronDown,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  clock: Clock,
  dashboard: LayoutDashboard,
  download: Download,
  location: MapPin,
  map: MapPin,
  menu: Menu,
  minus: Minus,
  plus: Plus,
  search: Search,
  shield: ShieldCheck,
  sliders: SlidersHorizontal,
  trophy: Trophy,
  user: UserRound,
  users: Users,
  "users-round": UsersRound,
  x: X,
};

export function Icon({
  name,
  size = 18,
  className,
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  const Component = icons[name];
  return <Component size={size} className={className} aria-hidden="true" />;
}

export function Logo({ compact = false, href = "/" }: { compact?: boolean; href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5" aria-label="BOB1 — Tableau de bord">
      <svg
        viewBox="0 0 48 48"
        className={compact ? "size-8 shrink-0" : "size-10 shrink-0"}
        role="img"
        aria-label="BOB1"
      >
        <circle cx="24" cy="24" r="21" fill="none" stroke="var(--green)" strokeWidth="4" />
        <circle cx="24" cy="24" r="15" fill="var(--brand)" />
        <path
          d="M9 24h30M24 9c-5 4-7 9-7 15s2 11 7 15M24 9c5 4 7 9 7 15s-2 11-7 15"
          fill="none"
          stroke="var(--brand-foreground)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
      {!compact && (
        <span className="flex flex-col">
          <strong className="font-display text-[17px] font-extrabold leading-none tracking-[0.08em]">BOB1</strong>
          <small className="mt-1 text-[9px] font-medium text-soft">Le club, ensemble</small>
        </span>
      )}
    </Link>
  );
}

export function Brand({ children }: { children: ReactNode }) {
  return <div className="flex items-center gap-2.5">{children}</div>;
}
