import lookupsJson from "@/data/lookups.json";
import type { LookupsDto } from "@/types";

/** Closed value lists of the club (roles, categories, slot templates…), kept in data/lookups.json. */
const lookups: LookupsDto = lookupsJson;

const pointCategoryLabels: Record<string, string> = Object.fromEntries(
  lookups.pointCategories.map((item) => [item.value, item.label]),
);

const derived = {
  ...lookups,
  loading: false,
  error: null as string | null,
  pointCategoryKeys: lookups.pointCategories.map((item) => item.value),
  pointCategoryLabel: (key: string) => pointCategoryLabels[key] ?? key,
  notificationTypeNames: lookups.notificationTypes.map((item) => item.value),
};

export function useLookups() {
  return derived;
}
