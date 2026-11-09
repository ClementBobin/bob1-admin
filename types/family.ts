export type AdminFamilyMemberDto = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  isActive: boolean;
};

export type AdminFamilyDto = {
  id: string;
  name: string;
  members: AdminFamilyMemberDto[];
  createdAtUtc: string;
};

export type Family = {
  id: string;
  name: string;
  parents: string;
  size: string;
  accounts: string;
  status: string;
  hasInactiveAccounts: boolean; // for filtering
};
