/**
 * Typed client for Bob1-api.
 *
 * The admin back-office talks to the API directly from the browser:
 *  - the access token is kept in localStorage and sent as a Bearer header,
 *  - a 401 triggers a single refresh attempt, then the request is replayed,
 *  - every failure is normalized to an ApiError carrying the API's stable code.
 */

import type {
  AdminFamilyDto,
  AuthResponse,
  AuthUser,
  BroadcastResponse,
  CreatePersonResponse,
  DivisionDto,
  EntryDto,
  FamilyRankingResponse,
  MatchDto,
  MembershipDto,
  SeasonDto,
  SeasonOverview,
  DivisionQuery,
  FamilyQuery,
  MatchQuery,
  NotificationQuery,
  Paged,
  PeopleQuery,
  PenaltyQuery,
  PointsHistoryQuery,
  RankingQuery,
  RuleQuery,
  TeamQuery,
  UrgentQuery,
  UrgentSlotPage,
  VenueQuery,
  MatchInput,
  NotificationDto,
  PenaltyDto,
  PersonDto,
  PersonInput,
  RankingResponse,
  RankingRuleDto,
  SlotInput,
  RosterDto,
  TeamDto,
  UrgentSlotDto,
  VenueDto,
} from "@/types";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not configured");
}

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
  method?: "GET" | "QUERY" | "POST" | "PUT" | "PATCH" | "DELETE";
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

/**
 * Lists use the HTTP QUERY method: a safe, idempotent read whose search / filter / paging
 * criteria travel in the JSON body. A body is always sent (even empty) so the content type is set.
 */
function search<T>(path: string, criteria: object = {}) {
  const body = Object.fromEntries(
    Object.entries(criteria).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  );
  return apiFetch<T>(path, { method: "QUERY", body });
}

/** Page size used when a screen needs every row (dropdowns, lookups). */
const ALL = 500;

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
    list: (params: DivisionQuery = {}) => search<Paged<DivisionDto>>("/divisions", params),
    all: () => search<Paged<DivisionDto>>("/divisions", { take: ALL }).then((page) => page.items),
    create: (input: { name: string; category: string; gender: string; isActive: boolean }) =>
      apiFetch<DivisionDto>("/admin/divisions", { method: "POST", body: input }),
    update: (id: string, input: { name: string; category: string; gender: string; isActive: boolean }) =>
      apiFetch<DivisionDto>(`/admin/divisions/${id}`, { method: "PUT", body: input }),
    remove: (id: string) => apiFetch<void>(`/admin/divisions/${id}`, { method: "DELETE" }),
  },

  teams: {
    list: (params: TeamQuery = {}) => search<Paged<TeamDto>>("/teams", params),
    all: () => search<Paged<TeamDto>>("/teams", { take: ALL }).then((page) => page.items),
    create: (input: { name: string; divisionId: string; coachName?: string | null; coachUserId?: string | null; logoUrl?: string | null; isActive?: boolean; trainingVenueId?: string | null }) =>
      apiFetch<TeamDto>("/admin/teams", { method: "POST", body: input }),
    update: (id: string, input: { name: string; divisionId: string; coachName?: string | null; coachUserId?: string | null; logoUrl?: string | null; isActive?: boolean; trainingVenueId?: string | null }) =>
      apiFetch<TeamDto>(`/admin/teams/${id}`, { method: "PUT", body: input }),
    remove: (id: string) => apiFetch<void>(`/admin/teams/${id}`, { method: "DELETE" }),
  },

  venues: {
    list: (params: VenueQuery = {}) => search<Paged<VenueDto>>("/venues", params),
    all: () => search<Paged<VenueDto>>("/venues", { take: ALL }).then((page) => page.items),
    create: (input: { name: string; address: string | null; city: string | null; postalCode: string | null }) =>
      apiFetch<VenueDto>("/admin/venues", { method: "POST", body: input }),
    update: (id: string, input: { name: string; address: string | null; city: string | null; postalCode: string | null }) =>
      apiFetch<VenueDto>(`/admin/venues/${id}`, { method: "PUT", body: input }),
    remove: (id: string) => apiFetch<void>(`/admin/venues/${id}`, { method: "DELETE" }),
  },

  // ---- Seasons ----
  seasons: {
    list: () => search<SeasonDto[]>("/seasons", {}),
    overview: () => search<SeasonOverview[]>("/admin/seasons/overview", {}),
  },

  // ---- Matches ----
  matches: {
    list: (params: MatchQuery = {}) => search<Paged<MatchDto>>("/matches", params),
    all: (params: MatchQuery = {}) =>
      search<Paged<MatchDto>>("/matches", { ...params, take: 300 }).then((page) => page.items),
    create: (input: MatchInput) =>
      apiFetch<MatchDto>("/admin/matches", { method: "POST", body: input }),
    update: (id: string, input: MatchInput) =>
      apiFetch<MatchDto>(`/admin/matches/${id}`, { method: "PUT", body: input }),
    cancel: (id: string) =>
      apiFetch<MatchDto>(`/admin/matches/${id}/cancel`, { method: "POST" }),
    markPlayed: (id: string) =>
      apiFetch<MatchDto>(`/admin/matches/${id}/played`, { method: "POST" }),
  },

  // ---- Participation (admin) ----
  slots: {
    create: (matchId: string, input: SlotInput) =>
      apiFetch<{ id: string }>(`/admin/matches/${matchId}/slots`, { method: "POST", body: input }),
    roster: (matchId: string) => apiFetch<RosterDto>(`/admin/matches/${matchId}/participation`),
    update: (id: string, input: SlotInput) =>
      apiFetch<void>(`/admin/slots/${id}`, { method: "PUT", body: input }),
    remove: (id: string) => apiFetch<void>(`/admin/slots/${id}`, { method: "DELETE" }),
    urgent: (params: UrgentQuery = {}) => search<UrgentSlotPage<UrgentSlotDto>>("/admin/slots/urgent", params),
  },

  // ---- People (admin) ----
  people: {
    list: (params: PeopleQuery = {}) =>
      search<Paged<PersonDto>>("/admin/people", params),
    all: () => search<Paged<PersonDto>>("/admin/people", { take: 200 }).then((page) => page.items),
    create: (input: PersonInput) =>
      apiFetch<CreatePersonResponse>("/admin/people", { method: "POST", body: input }),
    update: (id: string, input: Omit<PersonInput, "roles" | "password">) =>
      apiFetch<PersonDto>(`/admin/people/${id}`, { method: "PUT", body: input }),
    memberships: (id: string) => search<MembershipDto[]>(`/admin/people/${id}/memberships`, {}),
    setRoles: (id: string, roles: string[]) =>
      apiFetch<PersonDto>(`/admin/people/${id}/roles`, { method: "PUT", body: { roles } }),
    setActive: (id: string, isActive: boolean) =>
      apiFetch<void>(`/admin/people/${id}/active`, { method: "PUT", body: { isActive } }),
    setSuspendedFromParticipation: (id: string, suspended: boolean) =>
      apiFetch<void>(`/admin/people/${id}/suspended-from-participation`, { method: "PUT", body: { isActive: suspended } }),
  },

  // ---- Families (admin) ----
  families: {
    list: (params: FamilyQuery = {}) =>
      search<Paged<AdminFamilyDto>>("/admin/families", params),
    create: (name: string) =>
      apiFetch<AdminFamilyDto>("/admin/families", { method: "POST", body: { name } }),
    update: (id: string, name: string) =>
      apiFetch<AdminFamilyDto>(`/admin/families/${id}`, { method: "PUT", body: { name } }),
    remove: (id: string) => apiFetch<void>(`/admin/families/${id}`, { method: "DELETE" }),
  },

  // ---- Ranking ----
  rankings: {
    // Person rankings
    get: (params: RankingQuery = {}) =>
      search<RankingResponse | FamilyRankingResponse>("/admin/rankings", params),
    // My entries
    myEntries: (season?: string, take?: number) =>
      search<EntryDto[]>("/rankings/me/entries", { season, take }),
    rules: (params: RuleQuery = {}) => search<Paged<RankingRuleDto>>("/ranking-rules", params),
    allRules: () => search<Paged<RankingRuleDto>>("/ranking-rules", { take: ALL }).then((page) => page.items),
    updateRule: (key: string, points: number, label?: string, pointsJ15?: number, pointsJ4?: number) =>
      apiFetch<RankingRuleDto>(`/admin/ranking-rules/${encodeURIComponent(key)}`, {
        method: "PUT",
        body: { points, label, pointsJ15, pointsJ4 },
      }),
    penalties: (params: PenaltyQuery = {}) => search<Paged<PenaltyDto>>("/admin/penalties", params),
    createPenalty: (input: {
      personId: string;
      ruleKey?: string;
      points?: number;
      reason?: string;
      matchId?: string | null;
      /** Points category (presence, volunteer…); negative points = penalty. */
      category?: string;
    }) => apiFetch<{ id: string }>("/admin/penalties", { method: "POST", body: input }),
    /** Edit a manual entry. */
    updatePoints: (id: string, input: { category: string; points: number; reason: string; matchId?: string | null }) =>
      apiFetch<EntryDto>(`/admin/points/${id}`, { method: "PUT", body: input }),
    /** Revoke a manual entry (an opposite entry is appended). */
    revokePoints: (id: string) => apiFetch<void>(`/admin/points/${id}/revoke`, { method: "POST" }),
    // Points history
    history: (params: PointsHistoryQuery = {}) => search<Paged<EntryDto>>("/admin/points-history", params),
  },

  // ---- Notifications ----
  notifications: {
    list: (take = 100) => search<NotificationDto[]>("/notifications", { take }),
    unreadCount: () => apiFetch<{ count: number }>("/notifications/unread-count"),
    markRead: (id: string) =>
      apiFetch<void>(`/notifications/${id}/read`, { method: "POST" }),
    readAll: () => apiFetch<void>("/notifications/read-all", { method: "POST" }),
    broadcast: (title: string, body: string, divisionId?: string | null, expiresAtUtc?: string | null, recurring?: boolean, startup?: boolean, teamId?: string | null) =>
      apiFetch<BroadcastResponse>("/admin/notifications", {
        method: "POST",
        body: { title, body, divisionId, teamId, expiresAtUtc, recurring, startup },
      }),
    adminList: (params: NotificationQuery = {}) => search<Paged<NotificationDto>>("/admin/notifications", params),
    update: (id: string, input: { title: string; body: string; expiresAtUtc?: string | null; recurring?: boolean; startup?: boolean }) =>
      apiFetch<NotificationDto>(`/admin/notifications/${id}`, { method: "PUT", body: input }),
    remove: (id: string) => apiFetch<void>(`/admin/notifications/${id}`, { method: "DELETE" }),
  },
};
