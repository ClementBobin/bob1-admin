import type { PointCategory, Tone } from "@/types";

/* ── Points ─────────────────────────────────────────────── */
export const POINT_CATEGORIES: PointCategory[] = ["presence", "volunteer", "staff", "carpool", "penalty"];

export const POINT_CATEGORY_LABELS: Record<string, string> = {
  presence: "Présence",
  volunteer: "Bénévolat",
  staff: "Officiel / staff",
  carpool: "Covoiturage",
  penalty: "Pénalité",
};

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
export const ROLE_OPTIONS = ["Parent", "Staff", "Admin"];
export const PERSON_STATUS_OPTIONS = ["Actif", "Suspendu"];
export const TEAM_STATUS_OPTIONS = ["Active", "Externe", "Archivée"];
export const MATCH_STATUS_OPTIONS = ["J-15", "Confirmé", "Annulé"];
export const ACCOUNTS_OPTIONS = ["Complet", "À compléter"];
export const READ_STATUS_OPTIONS = ["Lue", "Non lue"];
export const NOTIFICATION_TYPE_OPTIONS = ["Général", "Match", "Urgent", "Pénalité"];

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
