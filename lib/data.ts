export type Tone = "success" | "warning" | "danger" | "info" | "neutral";

export const RULE_CATEGORY_LABELS: Record<string, string> = {
  presence: "Présence",
  volunteer: "Bénévolat",
  staff: "Officiel / staff",
  carpool: "Covoiturage",
  penalty: "Pénalité",
};


export type MatchRow = {
  id: string;
  date: string;
  division: string;
  home: string;
  away: string;
  venue: string;
  officials: [number, number];
  chrono: [number, number];
  mar: [number, number];
  buvette: [number, number];
  carpool: string;
  status: string;
};

export type Person = {
  id: string;
  name: string;
  email: string;
  roles: string[];
  status: string; // Actif / Suspendu / En attente
  suspendedFromParticipation: boolean;
  lastLogin: string;
};

export type Family = {
  id: string;
  name: string;
  parents: string;
  children: string;
  size: string;
  accounts: string;
  status: string;
  hasInactiveAccounts: boolean; // for filtering
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

// Points history (all entries)
export type HistoryEntry = {
  id: string;
  person: string;
  category: string;
  points: number;
  reason: string;
  match: string;
  date: string;
  isPenalty: boolean;
  isRevoked: boolean;
};
