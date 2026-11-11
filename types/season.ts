export type SeasonDto = { label: string; startsOn: string; endsOn: string; isCurrent: boolean };

export type SeasonOverview = {
  label: string;
  startsOn: string;
  endsOn: string;
  isCurrent: boolean;
  players: number;
  playersByDivision: { divisionId: string; divisionName: string; players: number }[];
  matchesTotal: number;
  matchesPlayed: number;
  matchesCancelled: number;
  pointEntries: number;
  pointsAwarded: number;
  pointsRemoved: number;
  manualAdjustments: number;
};

/** One line of a person's Parcours. */
export type MembershipDto = { season: string; divisionId: string; divisionName: string };
