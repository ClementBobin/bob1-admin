import { CalendarDays, Clock, ShieldAlert, Users } from "lucide-react";
import type { KpiIconMap, Tone } from "@/types";

/* ── Filter sentinels ("all" option of each filter) ─────── */
export const FILTER_ALL: Record<"statuses" | "roles" | "types" | "accounts" | "divisions" | "categories", string> = {
  statuses: "Tous les statuts",
  roles: "Tous les rôles",
  types: "Tous les types",
  accounts: "Tous les comptes",
  divisions: "Toutes les divisions",
  categories: "Toutes les catégories",
};

/* ── Option lists ───────────────────────────────────────── */
export const PERSON_STATUS_OPTIONS = ["Actif", "Suspendu", "Désactivé"];
export const TEAM_STATUS_OPTIONS = ["Active", "Archivée"];
export const READ_STATUS_OPTIONS = ["Lue", "Non lue"];

/* ── Tone class maps ────────────────────────────────────── */
export const ROLE_TONE_CLASSES: Record<string, string> = {
  Parent: "bg-info-soft text-info",
  Staff: "bg-mint text-mint-foreground",
  Admin: "bg-brand-soft text-brand",
};

/** Status label → badge tone, shared by match / division / team / person tables. */
export const STATUS_TONES: Record<string, Tone> = {
  Confirmé: "success",
  "J-4": "success",
  Active: "success",
  Actif: "success",
  Brouillon: "neutral",
  Annulé: "neutral",
  Archivée: "neutral",
  Externe: "info",
  Suspendu: "danger",
};

export function statusTone(status: string, fallback: Tone = "warning"): Tone {
  return STATUS_TONES[status] ?? fallback;
}

export const ACTIVE_STATUS_OPTIONS = ["Active", "Inactive"];

/* ── Dashboard ──────────────────────────────────────────── */
export const KPI_ICONS: KpiIconMap = {
  calendar: CalendarDays,
  users: Users,
  clock: Clock,
  shield: ShieldAlert,
};

export const KPI_TONE_CLASSES: Record<Tone, string> = {
  success: "bg-mint text-mint-foreground",
  warning: "bg-brand-soft text-brand",
  info: "bg-info-soft text-info",
  danger: "bg-danger-soft text-danger",
  neutral: "bg-muted text-soft",
};

export const DOT_TONE_CLASSES: Record<Tone, string> = {
  success: "bg-green",
  warning: "bg-brand",
  danger: "bg-danger",
  info: "bg-info",
  neutral: "bg-soft",
};

export const KPI_LINKS: Record<string, string> = {
  "Matchs à venir": "/matches",
  "Postes non pourvus": "/matches",
  "Confirmations en attente": "/matches",
  "Points récents": "/points-history",
  "Pénalités récentes": "/points-history",
};

/** Server match status (see GET /lookups matchStatuses) → label shown in the status filter. */
export const MATCH_STATUS_LABELS: Record<string, string> = {
  Scheduled: "Programmé",
  Cancelled: "Annulé",
  Played: "Joué",
};
