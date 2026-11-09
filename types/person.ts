export type PersonDto = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  isActive: boolean;
  suspendedFromParticipation: boolean;
  familyId: string | null;
  divisionId: string | null;
};

export type PersonInput = {
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  familyId?: string | null;
  divisionId?: string | null;
  password?: string | null;
};

export type CreatePersonResponse = {
  person: PersonDto;
  temporaryPassword: string | null;
};

export type Person = {
  id: string;
  name: string;
  email: string;
  roles: string[];
  status: string; // Actif / Suspendu / Désactivé
  isActive: boolean;
  suspendedFromParticipation: boolean;
  /** Raw API fields, kept so the edit form can update the right records. */
  familyId?: string | null;
  divisionId?: string | null;
  personId?: string;
};

/** What the person form hands back to the page. */
export type PersonPayload = {
  personId: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  isActive: boolean;
  suspendedFromParticipation: boolean;
  /** Players (children) belong to a division; null for everyone else. */
  divisionId: string | null;
};
