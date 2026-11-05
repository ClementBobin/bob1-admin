export type MatchStatus = "Scheduled" | "Cancelled" | "Played";

export type MatchDto = {
  id: string;
  title: string;
  divisionId: string;
  divisionName: string;
  opponent: string;
  isHome: boolean;
  venueName: string;
  startsAtUtc: string;
  status: MatchStatus;
  homeScore: number | null;
  awayScore: number | null;
};

export type MatchInput = {
  divisionId: string;
  opponent: string;
  isHome: boolean;
  venueId: string;
  startsAtUtc: string;
};

export type SlotInput = {
  kind: string;
  role: string;
  capacity: number;
  startsAtUtc?: string | null;
  endsAtUtc?: string | null;
};

export type UrgentSlotDto = {
  slotId: string;
  matchId: string;
  matchTitle: string;
  matchStartsAtUtc: string;
  kind: string;
  role: string;
  missing: number;
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
  /** Raw API fields, kept so the edit form can be prefilled. */
  opponent?: string;
  isHome?: boolean;
  startsAtUtc?: string;
};

export type SlotKind = "Staff" | "Volunteer";


/** What the match form hands back to the page. */
export type MatchPayload = {
  divisionName: string;
  opponent: string;
  isHome: boolean;
  venueName: string;
  date: string;
  time: string;
  slots: Record<string, number>;
  row: MatchRow;
};
