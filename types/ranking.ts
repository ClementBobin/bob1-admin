import type { Family } from "./family";
import type { Person } from "./person";

// Person-level ranking
export type PersonRankingRowDto = {
  rank: number;
  personId: string;
  personName: string;
  familyName: string | null;
  points: number;
  isMine: boolean;
};

export type RankingResponse = {
  season: string;
  top: PersonRankingRowDto[];
  mine: PersonRankingRowDto | null;
};

// Family-level ranking
export type FamilyRankingRowDto = {
  rank: number;
  familyId: string;
  familyName: string;
  points: number;
  isMine: boolean;
};

export type FamilyRankingResponse = {
  season: string;
  top: FamilyRankingRowDto[];
  mine: FamilyRankingRowDto | null;
};

export type RankingRuleDto = {
  key: string;
  category: string;
  label: string;
  points: number;
  pointsJ15: number | null;
  pointsJ4: number | null;
  hasJ15J4: boolean;
};

// Person-level ranking by category
export type PersonRankingRow = {
  rank: number;
  person: string;
  family: string;
  points: number;
  highlight?: boolean;
};

// Family-level ranking by category (aggregated from person rankings)
export type FamilyRankingRow = {
  rank: number;
  family: string;
  points: number;
  highlight?: boolean;
};

// Rules: some have J-15/J-4, others just single points
export type RuleRow = {
  key: string;
  category: string;
  label: string;
  points: number;
  pointsJ15?: number;
  pointsJ4?: number;
  hasJ15J4: boolean;
};

/** Point category key (served by GET /lookups). */
export type PointCategory = string;

export type RankingViewMode = "person" | "family";

export type RankingsData<Row> = { rows: Row[]; season: string };
