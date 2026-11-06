export type VenueDto = { id: string; name: string; address: string | null; city: string | null; postalCode: string | null };

export type VenueRow = {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  matches: string;
};
