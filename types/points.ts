export type PenaltyDto = {
  id: string;
  personId: string;
  personName: string;
  points: number;
  reason: string;
  matchId: string | null;
  season: string;
  createdAtUtc: string;
  isManual: boolean;
  isRevoked: boolean;
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
  /** Created by an admin: can be edited and revoked. */
  isManual: boolean;
  /** A manual entry that was revoked (an opposite entry exists). */
  isRevoked: boolean;
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
  /** Negative points (there is no penalty category any more). */
  isPenalty: boolean;
  isManual: boolean;
  isRevoked: boolean;
  /** The opposite entry appended when a manual entry is revoked. */
  isRevocation: boolean;
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
