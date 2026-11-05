export type LookupOption = { value: string; label: string };

export type SlotTemplate = { key: string; role: string; kind: string; defaultCapacity: number };

/** Closed value lists served by GET /lookups. */
export type LookupsDto = {
  clubName: string;
  roles: string[];
  divisionGenders: string[];
  divisionCategories: string[];
  matchStatuses: string[];
  slotKinds: string[];
  slotTemplates: SlotTemplate[];
  pointCategories: LookupOption[];
  notificationTypes: LookupOption[];
};
