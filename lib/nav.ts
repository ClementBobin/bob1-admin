import {
  Bell,
  CalendarDays,
  LayoutDashboard,
  MapPin,
  ShieldCheck,
  SlidersHorizontal,
  Trophy,
  UserRound,
  Users,
  UsersRound,
  History,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
};

export type NavGroup = {
  label: string;
  icon: LucideIcon;
  items: NavItem[];
};

export const adminNavGroups: NavGroup[] = [
  {
    label: "Général",
    icon: LayoutDashboard,
    items: [{ href: "/", label: "Tableau de bord", icon: LayoutDashboard }],
  },
  {
    label: "Organisation",
    icon: CalendarDays,
    items: [
      { href: "/matches", label: "Matchs", icon: CalendarDays },
      { href: "/divisions", label: "Divisions", icon: ShieldCheck },
      { href: "/teams", label: "Équipes", icon: Users },
      { href: "/venues", label: "Lieux", icon: MapPin },
    ],
  },
  {
    label: "Membres",
    icon: Users,
    items: [
      { href: "/people", label: "Personnes", icon: UserRound },
      { href: "/families", label: "Familles", icon: UsersRound },
    ],
  },
  {
    label: "Classement & Points",
    icon: Trophy,
    items: [
      { href: "/rankings", label: "Classements", icon: Trophy },
      { href: "/points-history", label: "Historique des points", icon: History },
      { href: "/rules", label: "Règles de points", icon: SlidersHorizontal },
    ],
  },
  {
    label: "Communication",
    icon: Bell,
    items: [
      { href: "/notifications", label: "Historique des notifications", icon: Bell },
      { href: "/notifications/create", label: "Nouvelle notification", icon: Bell },
    ],
  },
];

// Keep backward compat
export const adminNav: NavItem[] = adminNavGroups.flatMap((g) => g.items);