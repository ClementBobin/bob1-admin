export type MatchStatus = "Scheduled" | "Cancelled" | "Played";

export type MatchDto = {
  id: string;
  title: string;
  divisionId: string;
  divisionName: string;
  homeTeamId: string;
  awayTeamId: string;
  venueId: string;
  startsAtUtc: string;
  status: MatchStatus;
};

export type MatchInput = {
  divisionId: string;
  homeTeamId: string;
  awayTeamId: string;
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

/** Admin roster of a match (GET /admin/matches/{id}/participation). */
export type RosterSlotDto = {
  slotId: string;
  kind: string;
  role: string;
  capacity: number;
  people: { userId: string; name: string }[];
};
export type RosterDto = { familiesConfirmed: string[]; slots: RosterSlotDto[] };

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
  status: string;
  /** Raw API fields, kept so the edit form can be prefilled. */
  startsAtUtc?: string;
};


/** What the match form hands back to the page. */
export type MatchPayload = {
  divisionName: string;
  homeTeamName: string;
  awayTeamName: string;
  venueName: string;
  date: string;
  time: string;
  slots: Record<string, number>;
  row: MatchRow;
};
