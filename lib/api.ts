/**
 * Typed client for Bob1-api.
 *
 * The admin back-office talks to the API directly from the browser:
 *  - the access token is kept in localStorage and sent as a Bearer header,
 *  - a 401 triggers a single refresh attempt, then the request is replayed,
 *  - every failure is normalized to an ApiError carrying the API's stable code.
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not configured");
}

// ---------------------------------------------------------------------------
// DTOs (mirror the records exposed by Bob1-api)
// ---------------------------------------------------------------------------

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  familyId: string | null;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
  user: AuthUser;
};

export type DivisionDto = { id: string; name: string; sortOrder: number; category: string; gender: string; isActive: boolean };
export type TeamDto = { id: string; name: string; divisionId: string; coachName: string | null; coachUserId: string | null; logoUrl: string | null; isActive: boolean; trainingVenueId: string | null; trainingVenueName: string | null };
export type VenueDto = { id: string; name: string; address: string | null; city: string | null; postalCode: string | null };

export type MatchStatus = "Scheduled" | "Cancelled" | "Played";

export type MatchDto = {
  id: string;
  title: string;
  divisionId: string;
  divisionName: string;
  opponent: string;
  isHome: boolean;
  venueName: string;
  startsAtUtc: string;
  status: MatchStatus;
  homeScore: number | null;
  awayScore: number | null;
};

export type MatchInput = {
  divisionId: string;
  opponent: string;
  isHome: boolean;
  venueId: string;
  startsAtUtc: string;
};

export type SlotInput = {
  kind: "Staff" | "Volunteer";
  role: string;
  capacity: number;
  startsAtUtc?: string | null;
  endsAtUtc?: string | null;
};

export type PersonDto = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  isActive: boolean;
  suspendedFromParticipation: boolean;
  familyId: string | null;
};

export type PersonInput = {
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  familyId?: string | null;
  password?: string | null;
};

export type CreatePersonResponse = {
  person: PersonDto;
  temporaryPassword: string | null;
};

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

// Person-level ranking
export type PersonRankingRowDto = {
  rank: number;
  personId: string;
  personName: string;
  familyName: string | null;
  points: number;
  isMine: boolean;
};

export type RankingResponse = {
  season: string;
  top: PersonRankingRowDto[];
  mine: PersonRankingRowDto | null;
};

// Family-level ranking
export type FamilyRankingRowDto = {
  rank: number;
  familyId: string;
  familyName: string;
  points: number;
  isMine: boolean;
};

export type FamilyRankingResponse = {
  season: string;
  top: FamilyRankingRowDto[];
  mine: FamilyRankingRowDto | null;
};

export type RankingRuleDto = {
  key: string;
  category: string;
  label: string;
  points: number;
  pointsJ15: number | null;
  pointsJ4: number | null;
  hasJ15J4: boolean;
};

export type PenaltyDto = {
  id: string;
  personId: string;
  personName: string;
  points: number;
  reason: string;
  matchId: string | null;
  season: string;
  createdAtUtc: string;
};

export type EntryDto = {
  id: string;
  category: string;
  points: number;
  reason: string;
  matchId: string | null;
  createdAtUtc: string;
  personId: string;
  personName: string;
};

export type NotificationDto = {
  id: string;
  title: string;
  body: string;
  dataJson: string | null;
  createdAtUtc: string;
  isRead: boolean;
  expiresAtUtc: string | null;
  recurring: boolean;
  startup: boolean;
};

export type BroadcastResponse = { recipients: number };

export type UrgentSlotDto = {
  slotId: string;
  matchId: string;
  matchTitle: string;
  matchStartsAtUtc: string;
  kind: string;
  role: string;
  missing: number;
};

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Une erreur inattendue est survenue.";
}

// ---------------------------------------------------------------------------
// Session storage
// ---------------------------------------------------------------------------

const ACCESS_KEY = "bob1.access-token";
const REFRESH_KEY = "bob1.refresh-token";
const USER_KEY = "bob1.user";

function readStorage(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* storage unavailable (private mode): keep the session in memory only */
  }
}

export function getAccessToken(): string | null {
  return readStorage(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  return readStorage(REFRESH_KEY);
}

export function getStoredUser(): AuthUser | null {
  const raw = readStorage(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function saveSession(response: AuthResponse) {
  writeStorage(ACCESS_KEY, response.accessToken);
  writeStorage(REFRESH_KEY, response.refreshToken);
  writeStorage(USER_KEY, JSON.stringify(response.user));
}

export function saveUser(user: AuthUser) {
  writeStorage(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
    window.localStorage.removeItem(USER_KEY);
  } catch {
    /* ignore */
  }
}

// ---------------------------------------------------------------------------
// Fetch wrapper with a single-flight refresh
// ---------------------------------------------------------------------------

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean;
  retry?: boolean;
};

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
          cache: "no-store",
        });
        if (!response.ok) {
          clearSession();
          return null;
        }
        const data = (await response.json()) as AuthResponse;
        saveSession(data);
        return data.accessToken;
      } catch {
        clearSession();
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true, retry = true } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    throw new ApiError(
      "Impossible de joindre l'API. Vérifiez que Bob1-api est démarrée et que NEXT_PUBLIC_API_URL est correct.",
      0
    );
  }

  if (response.status === 401 && auth && retry) {
    const token = await refreshAccessToken();
    if (token) return apiFetch<T>(path, { ...options, retry: false });
  }

  const payload = await parseBody(response);

  if (!response.ok) {
    const problem =
      payload && typeof payload === "object"
        ? (payload as { title?: string; detail?: string; code?: string })
        : {};
    throw new ApiError(
      problem.detail || problem.title || `Erreur HTTP ${response.status}`,
      response.status,
      problem.code || problem.title
    );
  }

  return payload as T;
}

// ---------------------------------------------------------------------------
// Endpoint helpers
// ---------------------------------------------------------------------------

function query(params: Record<string, string | number | boolean | null | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
  }
  const serialized = search.toString();
  return serialized ? `?${serialized}` : "";
}

export const api = {
  // ---- Auth ----
  login: (email: string, password: string) =>
    apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: { email, password },
      auth: false,
    }),

  refresh: (refreshToken: string) =>
    apiFetch<AuthResponse>("/auth/refresh", {
      method: "POST",
      body: { refreshToken },
      auth: false,
    }),

  me: () => apiFetch<AuthUser>("/me"),

  // ---- Club ----
  divisions: {
    list: () => apiFetch<DivisionDto[]>("/divisions"),
    create: (input: { name: string; sortOrder: number; category: string; gender: string; isActive: boolean }) =>
      apiFetch<DivisionDto>("/admin/divisions", { method: "POST", body: input }),
    update: (id: string, input: { name: string; sortOrder: number; category: string; gender: string; isActive: boolean }) =>
      apiFetch<DivisionDto>(`/admin/divisions/${id}`, { method: "PUT", body: input }),
    remove: (id: string) => apiFetch<void>(`/admin/divisions/${id}`, { method: "DELETE" }),
  },

  teams: {
    list: (divisionId?: string) =>
      apiFetch<TeamDto[]>(`/teams${query({ divisionId })}`),
    create: (input: { name: string; divisionId: string; coachName?: string | null; coachUserId?: string | null; logoUrl?: string | null; isActive?: boolean; trainingVenueId?: string | null }) =>
      apiFetch<TeamDto>("/admin/teams", { method: "POST", body: input }),
    update: (id: string, input: { name: string; divisionId: string; coachName?: string | null; coachUserId?: string | null; logoUrl?: string | null; isActive?: boolean; trainingVenueId?: string | null }) =>
      apiFetch<TeamDto>(`/admin/teams/${id}`, { method: "PUT", body: input }),
    remove: (id: string) => apiFetch<void>(`/admin/teams/${id}`, { method: "DELETE" }),
  },

  venues: {
    list: () => apiFetch<VenueDto[]>("/venues"),
    create: (input: { name: string; address: string | null; city: string | null; postalCode: string | null }) =>
      apiFetch<VenueDto>("/admin/venues", { method: "POST", body: input }),
    update: (id: string, input: { name: string; address: string | null; city: string | null; postalCode: string | null }) =>
      apiFetch<VenueDto>(`/admin/venues/${id}`, { method: "PUT", body: input }),
    remove: (id: string) => apiFetch<void>(`/admin/venues/${id}`, { method: "DELETE" }),
  },

  // ---- Matches ----
  matches: {
    list: (params: { divisionId?: string; from?: string; to?: string } = {}) =>
      apiFetch<MatchDto[]>(`/matches${query(params)}`),
    create: (input: MatchInput) =>
      apiFetch<MatchDto>("/admin/matches", { method: "POST", body: input }),
    update: (id: string, input: MatchInput) =>
      apiFetch<MatchDto>(`/admin/matches/${id}`, { method: "PUT", body: input }),
    cancel: (id: string) =>
      apiFetch<MatchDto>(`/admin/matches/${id}/cancel`, { method: "POST" }),
  },

  // ---- Participation (admin) ----
  slots: {
    create: (matchId: string, input: SlotInput) =>
      apiFetch<{ id: string }>(`/admin/matches/${matchId}/slots`, { method: "POST", body: input }),
    urgent: (days?: number) => apiFetch<UrgentSlotDto[]>(`/admin/slots/urgent${query({ days })}`),
  },

  // ---- People (admin) ----
  people: {
    list: (params: { search?: string; role?: string; skip?: number; take?: number } = {}) =>
      apiFetch<{ total: number; items: PersonDto[] }>(`/admin/people${query(params)}`),
    create: (input: PersonInput) =>
      apiFetch<CreatePersonResponse>("/admin/people", { method: "POST", body: input }),
    update: (id: string, input: Omit<PersonInput, "roles" | "password">) =>
      apiFetch<PersonDto>(`/admin/people/${id}`, { method: "PUT", body: input }),
    setRoles: (id: string, roles: string[]) =>
      apiFetch<PersonDto>(`/admin/people/${id}/roles`, { method: "PUT", body: { roles } }),
    setActive: (id: string, isActive: boolean) =>
      apiFetch<void>(`/admin/people/${id}/active`, { method: "PUT", body: { isActive } }),
    setSuspendedFromParticipation: (id: string, suspended: boolean) =>
      apiFetch<void>(`/admin/people/${id}/suspended-from-participation`, { method: "PUT", body: { isActive: suspended } }),
  },

  // ---- Families (admin) ----
  families: {
    list: (params: { search?: string; skip?: number; take?: number } = {}) =>
      apiFetch<{ total: number; items: AdminFamilyDto[] }>(`/admin/families${query(params)}`),
    create: (name: string) =>
      apiFetch<AdminFamilyDto>("/admin/families", { method: "POST", body: { name } }),
    update: (id: string, name: string) =>
      apiFetch<AdminFamilyDto>(`/admin/families/${id}`, { method: "PUT", body: { name } }),
    remove: (id: string) => apiFetch<void>(`/admin/families/${id}`, { method: "DELETE" }),
  },

  // ---- Ranking ----
  rankings: {
    // Person rankings
    get: (category?: string, view?: "person" | "family") =>
      apiFetch<RankingResponse | FamilyRankingResponse>(`/admin/rankings${query({ category, view })}`),
    // My entries
    myEntries: (season?: string, take?: number) =>
      apiFetch<EntryDto[]>(`/rankings/me/entries${query({ season, take })}`),
    rules: () => apiFetch<RankingRuleDto[]>("/ranking-rules"),
    updateRule: (key: string, points: number, label?: string, pointsJ15?: number, pointsJ4?: number) =>
      apiFetch<RankingRuleDto>(`/admin/ranking-rules/${encodeURIComponent(key)}`, {
        method: "PUT",
        body: { points, label, pointsJ15, pointsJ4 },
      }),
    penalties: (personId?: string) => apiFetch<PenaltyDto[]>(`/admin/penalties${query({ personId })}`),
    createPenalty: (input: {
      personId: string;
      ruleKey?: string;
      points?: number;
      reason?: string;
      matchId?: string | null;
    }) => apiFetch<{ id: string }>("/admin/penalties", { method: "POST", body: input }),
    revokePenalty: (id: string) =>
      apiFetch<void>(`/admin/penalties/${id}/revoke`, { method: "POST" }),
    // Points history
    history: (params: { personId?: string; category?: string; season?: string; skip?: number; take?: number } = {}) =>
      apiFetch<{ total: number; items: EntryDto[] }>(`/admin/points-history${query(params)}`),
  },

  // ---- Notifications ----
  notifications: {
    list: (take = 100) => apiFetch<NotificationDto[]>(`/notifications${query({ take })}`),
    unreadCount: () => apiFetch<{ count: number }>("/notifications/unread-count"),
    markRead: (id: string) =>
      apiFetch<void>(`/notifications/${id}/read`, { method: "POST" }),
    readAll: () => apiFetch<void>("/notifications/read-all", { method: "POST" }),
    broadcast: (title: string, body: string, divisionId?: string | null, expiresAtUtc?: string | null, recurring?: boolean, startup?: boolean) =>
      apiFetch<BroadcastResponse>("/admin/notifications", {
        method: "POST",
        body: { title, body, divisionId, expiresAtUtc, recurring, startup },
      }),
    adminList: (params: { search?: string; skip?: number; take?: number } = {}) =>
      apiFetch<{ total: number; items: NotificationDto[] }>(`/admin/notifications${query(params)}`),
    update: (id: string, input: { title: string; body: string; expiresAtUtc?: string | null; recurring?: boolean; startup?: boolean }) =>
      apiFetch<NotificationDto>(`/admin/notifications/${id}`, { method: "PUT", body: input }),
    remove: (id: string) => apiFetch<void>(`/admin/notifications/${id}`, { method: "DELETE" }),
  },
};
