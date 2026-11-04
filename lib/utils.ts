import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { MatchStatus } from "./api";

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