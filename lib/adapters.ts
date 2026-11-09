import { formatDate, formatDateTime, matchStatusLabel } from "./utils";
import type { AdminFamilyDto, DivisionDto, EntryDto, Family, FamilyRankingRow, FamilyRankingRowDto, HistoryEntry, MatchDto, MatchRow, PenaltyDto, Person, PersonDto, PersonRankingRow, PersonRankingRowDto, RankingRuleDto, RosterDto, RuleRow, SlotTemplate, TeamDto } from "@/types";

/** Team and venue names are not in the match payload: callers pass id → name maps built from the club data. */
export type MatchNames = { teams: Map<string, string>; venues: Map<string, string> };

export function matchToRow(match: MatchDto, names: MatchNames, slots: Record<string, [number, number]> = {}): MatchRow {
  return {
    id: match.id,
    date: formatDateTime(match.startsAtUtc),
    division: match.divisionName,
    home: names.teams.get(match.homeTeamId) ?? "—",
    away: names.teams.get(match.awayTeamId) ?? "—",
    venue: names.venues.get(match.venueId) ?? "—",
    officials: slots.arbitres ?? [0, 0],
    buvette: slots.buvette ?? [0, 0],
    chrono: slots.chrono ?? [0, 0],
    mar: slots.mar ?? [0, 0],
    status: matchStatusLabel(match.status),
  };
}

/** [filled, capacity] per slot template key, from a match roster (slots are matched on their role). */
export function slotCounts(roster: RosterDto | undefined, templates: SlotTemplate[]): Record<string, [number, number]> {
  const counts: Record<string, [number, number]> = {};
  for (const template of templates) {
    const slot = roster?.slots.find((item) => item.role.toLowerCase() === template.role.toLowerCase());
    counts[template.key] = slot ? [slot.people.length, slot.capacity] : [0, 0];
  }
  return counts;
}

/** Désactivé = account disabled; Suspendu = active account barred from participating; Actif otherwise. */
export function personStatus(person: Pick<PersonDto, "isActive" | "suspendedFromParticipation">): string {
  if (!person.isActive) return "Désactivé";
  return person.suspendedFromParticipation ? "Suspendu" : "Actif";
}

export function personToRow(person: PersonDto): Person {
  return {
    id: person.id,
    name: `${person.firstName} ${person.lastName}`.trim(),
    email: person.email,
    roles: person.roles,
    status: personStatus(person),
    isActive: person.isActive,
    suspendedFromParticipation: person.suspendedFromParticipation,
  };
}

export function familyToRow(family: AdminFamilyDto): Family {
  const parents = family.members.map((member) => `${member.firstName} ${member.lastName}`.trim());
  const size = family.members.length;
  const hasInactiveAccounts = family.members.some((m) => !m.isActive);
  return {
    id: family.id,
    name: family.name,
    parents: parents.length ? parents.join(", ") : "À renseigner",
    size: `${size} membre${size > 1 ? "s" : ""}`,
    accounts: `${family.members.length} compte${family.members.length > 1 ? "s" : ""}`,
    status: family.members.length > 0 ? "Complet" : "À compléter",
    hasInactiveAccounts,
  };
}

export function personRankingToRow(row: PersonRankingRowDto): PersonRankingRow {
  return {
    rank: row.rank,
    person: row.personName,
    family: row.familyName ?? "—",
    points: row.points,
    highlight: row.isMine,
  };
}

export function familyRankingToRow(row: FamilyRankingRowDto): FamilyRankingRow {
  return {
    rank: row.rank,
    family: row.familyName,
    points: row.points,
    highlight: row.isMine,
  };
}

export function ruleToRow(rule: RankingRuleDto): RuleRow {
  return {
    key: rule.key,
    category: rule.category,
    label: rule.label,
    points: rule.points,
    pointsJ15: rule.pointsJ15 ?? undefined,
    pointsJ4: rule.pointsJ4 ?? undefined,
    hasJ15J4: rule.hasJ15J4,
  };
}

export function historyEntryToRow(entry: EntryDto): HistoryEntry {
  return {
    id: entry.id,
    person: entry.personName,
    category: entry.category,
    points: entry.points,
    reason: entry.reason,
    match: entry.matchId ? `Match ${entry.matchId.slice(0, 8)}` : "—",
    date: formatDate(entry.createdAtUtc),
    isPenalty: entry.category === "penalty" && entry.points < 0,
    isRevoked: entry.points > 0 && entry.reason.startsWith("Annulation"),
  };
}

export function penaltyToRow(penalty: PenaltyDto): HistoryEntry {
  return {
    id: penalty.id,
    person: penalty.personName,
    category: "penalty",
    points: penalty.points,
    reason: penalty.reason,
    match: penalty.matchId ? `Match ${penalty.matchId.slice(0, 8)}` : "—",
    date: formatDate(penalty.createdAtUtc),
    isPenalty: penalty.points < 0,
    isRevoked: false,
  };
}

export function divisionToRow(division: DivisionDto, teamCount = 0) {
  return {
    id: division.id,
    name: division.name,
    category: division.category,
    gender: division.gender,
    teams: `${teamCount} équipe${teamCount > 1 ? "s" : ""}`,
    status: division.isActive ? "Active" : "Inactive",
  };
}

export function teamCountByDivision(teams: TeamDto[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const team of teams) counts.set(team.divisionId, (counts.get(team.divisionId) ?? 0) + 1);
  return counts;
}
