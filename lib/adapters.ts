import type {
  AdminFamilyDto,
  DivisionDto,
  MatchDto,
  MatchStatus,
  PenaltyDto,
  PersonDto,
  RankingRowDto,
  TeamDto,
} from "@/lib/api";
import type { Family, MatchRow, PenaltyRow, Person, RankingRow } from "@/lib/data";

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  const day = date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }).replace(".", "");
  const time = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  return `${day} · ${time}`;
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }).replace(".", "");
}

export function matchStatusLabel(status: MatchStatus): string {
  switch (status) {
    case "Cancelled":
      return "Annulé";
    case "Played":
      return "Confirmé";
    default:
      return "J-15";
  }
}

export function matchToRow(match: MatchDto): MatchRow {
  return {
    id: match.id,
    date: formatDateTime(match.startsAtUtc),
    division: match.divisionName,
    home: match.isHome ? "BOB1" : match.opponent,
    away: match.isHome ? match.opponent : "BOB1",
    venue: match.venueName,
    // The admin API does not expose aggregate slot/carpool fill yet.
    officials: [0, 0],
    buvette: [0, 0],
    carpool: "—",
    status: matchStatusLabel(match.status),
  };
}

export function personToRow(person: PersonDto): Person {
  return {
    id: person.id,
    name: `${person.firstName} ${person.lastName}`.trim(),
    email: person.email,
    roles: person.roles,
    status: person.isActive ? "Actif" : "Suspendu",
    lastLogin: "—",
  };
}

export function familyToRow(family: AdminFamilyDto): Family {
  const parents = family.members.map((member) => `${member.firstName} ${member.lastName}`.trim());
  const children = family.children.map((child) => child.firstName);
  const size = family.members.length + family.children.length;
  return {
    id: family.id,
    name: family.name,
    parents: parents.length ? parents.join(", ") : "À renseigner",
    children: children.length ? children.join(", ") : "—",
    size: `${size} membre${size > 1 ? "s" : ""}`,
    accounts: `${family.members.length} compte${family.members.length > 1 ? "s" : ""}`,
    status: family.members.length > 0 ? "Complet" : "À compléter",
  };
}

export function rankingToRow(row: RankingRowDto): RankingRow {
  return {
    rank: row.rank,
    member: row.familyName,
    participations: 0,
    bonus: row.points > 0 ? row.points : 0,
    penalties: row.points < 0 ? row.points : 0,
    total: row.points,
    highlight: row.isMine,
  };
}

export function penaltyToRow(penalty: PenaltyDto): PenaltyRow {
  return {
    id: penalty.id,
    person: penalty.familyName,
    match: penalty.matchId ? `Match ${penalty.matchId.slice(0, 8)}` : "—",
    reason: penalty.reason,
    points: penalty.points,
    exclusion: false,
    created: formatDate(penalty.createdAtUtc),
    // The API has no "read" state for penalties; a ledger entry is final until revoked.
    status: "Reconnue",
  };
}

const DIVISION_CATEGORIES = ["U11", "U13", "U15", "U17", "U18", "Senior"];

export function divisionCategory(name: string): string {
  const normalized = name.trim();
  const match = DIVISION_CATEGORIES.find((category) =>
    normalized.toLowerCase().startsWith(category.toLowerCase())
  );
  return match ?? normalized.split(" ")[0] ?? "—";
}

export function divisionGender(name: string): string {
  const normalized = name.toLowerCase();
  if (normalized.includes("fémin") || normalized.includes("femin") || /\bf\b/.test(normalized)) return "Féminin";
  if (normalized.includes("mascul") || /\bm\b/.test(normalized)) return "Masculin";
  return "Mixte";
}

export function teamCountByDivision(teams: TeamDto[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const team of teams) counts.set(team.divisionId, (counts.get(team.divisionId) ?? 0) + 1);
  return counts;
}

export function divisionToRow(division: DivisionDto, teamCount = 0) {
  return {
    id: division.id,
    name: division.name,
    category: divisionCategory(division.name),
    gender: divisionGender(division.name),
    teams: `${teamCount} équipe${teamCount > 1 ? "s" : ""}`,
    status: "Active",
    sortOrder: division.sortOrder,
  };
}

const RULE_CATEGORY_LABELS: Record<string, string> = {
  presence: "Présence",
  volunteer: "Bénévolat",
  staff: "Officiel / staff",
  carpool: "Covoiturage",
  penalty: "Pénalité",
};

export function ruleCategoryLabel(category: string): string {
  return RULE_CATEGORY_LABELS[category] ?? category;
}
