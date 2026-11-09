export type TeamDto = { id: string; name: string; divisionId: string; coachName: string | null; coachUserId: string | null; logoUrl: string | null; isActive: boolean; trainingVenueId: string | null };

export type TeamRow = {
  id: string;
  name: string;
  division: string;
  coach: string;
  coachUserId: string | null;
  logo: string | null;
  players: string;
  status: string;
  trainingVenueId: string | null;
  trainingVenueName: string | null;
};
