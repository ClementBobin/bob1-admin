/** Envelope of every paginated QUERY endpoint. */
export type Paged<T> = { total: number; items: T[] };

export type PageParams = { skip?: number; take?: number };

export type DivisionQuery = PageParams & { search?: string; isActive?: boolean };
export type TeamQuery = PageParams & { search?: string; divisionId?: string; isActive?: boolean };
export type VenueQuery = PageParams & { search?: string };
export type MatchQuery = PageParams & {
  search?: string;
  divisionId?: string;
  status?: string;
  from?: string;
  to?: string;
};
export type PeopleQuery = PageParams & { search?: string; role?: string; isActive?: boolean; status?: "active" | "suspended" | "deactivated" };
export type FamilyQuery = PageParams & { search?: string; hideInactive?: boolean };
export type NotificationQuery = PageParams & { search?: string; type?: string; read?: boolean };
export type RankingQuery = PageParams & { category?: string; view?: "person" | "family"; search?: string; season?: string };
export type RuleQuery = PageParams & { search?: string; category?: string };
export type PenaltyQuery = PageParams & { personId?: string; search?: string; from?: string; season?: string };
export type PointsHistoryQuery = PageParams & { personId?: string; category?: string; search?: string; season?: string };
export type UrgentQuery = PageParams & { days?: number };

/** Urgent slots page + the grand total of missing places (dashboard KPI). */
export type UrgentSlotPage<T> = Paged<T> & { totalMissing: number };
