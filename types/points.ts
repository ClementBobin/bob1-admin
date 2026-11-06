export type PenaltyDto = {
  id: string;
  personId: string;
  personName: string;
  points: number;
  reason: string;
  matchId: string | null;
  season: string;
  createdAtUtc: string;
};

export type EntryDto = {
  id: string;
  category: string;
  points: number;
  reason: string;
  matchId: string | null;
  createdAtUtc: string;
  personId: string;
  personName: string;
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

export type HistoryRow = HistoryEntry & { categoryLabel?: string };

/** What the points forms (ranking adjustment / history) hand back to their page. */
export type PointsPayload = {
  personId: string | null;
  target: string;
  points: number;
  reason: string;
  category?: string;
};
