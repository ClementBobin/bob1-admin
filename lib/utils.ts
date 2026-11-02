import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
