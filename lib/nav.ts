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
  items: NavItem[];
};

export const adminNavGroups: NavGroup[] = [
  {
    label: "Général",
    items: [{ href: "/", label: "Tableau de bord", icon: LayoutDashboard }],
  },
  {
    label: "Organisation",
    items: [
      { href: "/matches", label: "Matchs", icon: CalendarDays },
      { href: "/divisions", label: "Divisions", icon: ShieldCheck },
      { href: "/teams", label: "Équipes", icon: Users },
      { href: "/venues", label: "Lieux", icon: MapPin },
    ],
  },
  {
    label: "Membres",
    items: [
      { href: "/people", label: "Personnes", icon: UserRound },
      { href: "/families", label: "Familles", icon: UsersRound },
    ],
  },
  {
    label: "Classement & Points",
    items: [
      { href: "/rankings", label: "Classements", icon: Trophy },
      { href: "/points-history", label: "Historique des points", icon: History },
      { href: "/rules", label: "Règles de points", icon: SlidersHorizontal },
    ],
  },
  {
    label: "Communication",
    items: [{ href: "/notifications", label: "Notifications", icon: Bell }],
  },
];

// Keep backward compat
export const adminNav: NavItem[] = adminNavGroups.flatMap((g) => g.items);