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
  /** Teams for the requested season (a player can be in several). */
  teamIds: string[];
};

export type PersonInput = {
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  familyId?: string | null;
  divisionId?: string | null;
  teamIds?: string[];
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
  teamIds?: string[];
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
  divisionId: string | null;  /** Teams of the current season. */
  teamIds: string[];
};

export type AccountLinkPurpose = "PasswordReset" | "EmailChange" | "DataExport" | "AccountDeletion";

/** A one-time link issued by an admin. The token is returned once; the admin app turns it into a URL for the person. */
export type AccountLinkResponse = {
  token: string;
  expiresAtUtc: string;
};

/** What the public page may show before the person acts. */
export type AccountLinkInfo = {
  purpose: AccountLinkPurpose;
  firstName: string;
  maskedEmail: string;
  expiresAtUtc: string;
};
