export type AdminFamilyMemberDto = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  isActive: boolean;
};

export type AdminFamilyChildDto = {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  divisionId: string | null;
};

export type AdminFamilyDto = {
  id: string;
  name: string;
  members: AdminFamilyMemberDto[];
  children: AdminFamilyChildDto[];
  createdAtUtc: string;
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
