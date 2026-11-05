import type { LucideIcon } from "lucide-react";
import type { Tone } from "./common";

export type KpiIcon = "calendar" | "users" | "clock" | "shield";

export type Kpi = {
  label: string;
  value: string;
  detail: string;
  icon: KpiIcon;
  tone: Tone;
};

export type AttentionMatch = {
  id: string | number;
  date: string;
  division: string;
  opponent: string;
  slots: string;
  urgent: boolean;
};

export type ActivityItem = {
  id: string | number;
  text: string;
  time: string;
  tone: Tone;
};

export type KpiIconMap = Record<KpiIcon, LucideIcon>;
