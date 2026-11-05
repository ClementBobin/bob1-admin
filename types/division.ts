export type DivisionDto = { id: string; name: string; sortOrder: number; category: string; gender: string; isActive: boolean };

export type DivisionRow = {
  id: string;
  name: string;
  category: string | null;
  gender: string | null;
  teams: string;
  status: string;
  sortOrder?: number;
};
