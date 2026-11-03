import {
  Bell,
  CalendarDays,
  Clock,
  History,
  LayoutDashboard,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Trophy,
  UserRound,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
};

export const adminNav: NavItem[] = [
  { href: "/", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/matches", label: "Matchs", icon: CalendarDays },
  { href: "/divisions", label: "Divisions", icon: ShieldCheck },
  { href: "/teams", label: "Équipes", icon: Users },
  { href: "/venues", label: "Lieux", icon: MapPin },
  { href: "/people", label: "Personnes", icon: UserRound },
  { href: "/families", label: "Familles", icon: UsersRound },
  { href: "/rankings", label: "Classements", icon: Trophy },
  { href: "/rules", label: "Règles de points", icon: SlidersHorizontal },
  { href: "/points-history", label: "Historique des points", icon: History },
  { href: "/notifications", label: "Notifications", icon: Bell },
];
