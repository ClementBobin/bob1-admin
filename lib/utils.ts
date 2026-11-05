import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { MatchStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function formatCount(count: number, page: number, pageSize: number) {
  if (count === 0) return "0 résultat";
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, count);
  return `${start}–${end} sur ${count}`;
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  const day = date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }).replace(".", "");
  const time = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  return `${day} · ${time}`;
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }).replace(".", "");
}

export function matchStatusLabel(status: MatchStatus): string {
  switch (status) {
    case "Cancelled":
      return "Annulé";
    case "Played":
      return "Confirmé";
    default:
      return "J-15";
  }
}
export function matchesSearch(needle: string, ...haystacks: Array<string | null | undefined>): boolean {
  const n = needle.trim().toLowerCase();
  if (!n) return true;
  return haystacks.some((h) => (h ?? "").toLowerCase().includes(n));
}

export function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${count} ${count > 1 ? pluralForm : singular}`;
}

export function fullName(...parts: Array<string | null | undefined>): string {
  return parts.filter(Boolean).join(" ").trim();
}

export function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function localDateParts(iso?: string): { date: string; time: string } {
  const date = iso ? new Date(iso) : null;
  if (!date || Number.isNaN(date.getTime())) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return {
      date: `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`,
      time: "14:30",
    };
  }
  return {
    date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  };
}

export function formatDateLabel(value: string, time: string) {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return `${value} · ${time}`;
  const label = date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }).replace(".", "");
  return `${label} · ${time}`;
}

/** Parses a user-typed points value ("+5", "-10", "2,5"). */
export function parsePoints(value: string): number {
  return Number(value.replace(",", ".").replace(/[^\d.+-]/g, ""));
}

/** Returns an error message when a points adjustment can't be submitted, else null. */
export function pointsAdjustmentError(
  payload: { personId: string | null; points: number },
  subject = "une personne",
): string | null {
  if (!Number.isFinite(payload.points) || payload.points === 0) return "Saisissez un nombre de points non nul.";
  if (!payload.personId) return `Sélectionnez ${subject}.`;
  return null;
}
