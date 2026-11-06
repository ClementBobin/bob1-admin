import type { LucideIcon } from "lucide-react";

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
