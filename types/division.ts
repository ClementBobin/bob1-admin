export type DivisionDto = { id: string; name: string; category: string; gender: string; isActive: boolean };

export type DivisionRow = {
  id: string;
  name: string;
  category: string | null;
  gender: string | null;
  teams: string;
  status: string;
};
