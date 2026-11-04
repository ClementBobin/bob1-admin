"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, ChevronRight, Clock, Plus, ShieldAlert, Users } from "lucide-react";
import { type Tone } from "@/lib/data";
import { api, type MatchDto, type PenaltyDto, type UrgentSlotDto } from "@/lib/api";
import { useApiData } from "@/lib/use-api-data";
import { displayName, useAuth } from "@/components/auth-provider";
import { cn, formatDate, formatDateTime } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Status } from "@/components/status";
import { PageHeader, CardHeading } from "@/components/page-header";

const kpiIcons = {
  calendar: CalendarDays,
  users: Users,
  clock: Clock,
  shield: ShieldAlert,
};

const kpiTones = {
  success: "bg-mint text-mint-foreground",
  warning: "bg-brand-soft text-brand",
  info: "bg-info-soft text-info",
  danger: "bg-danger-soft text-danger",
  neutral: "bg-muted text-soft",
};

const dotTones = {
  success: "bg-green",
  warning: "bg-brand",
  danger: "bg-danger",
  info: "bg-info",
  neutral: "bg-soft",
};

const kpiLinks: Record<string, string> = {
  "Matchs à venir": "/matches",
  "Postes non pourvus": "/matches",
  "Confirmations en attente": "/matches",
  "Points récents": "/points-history",
  "Pénalités récentes": "/points-history",
};

type KpiTone = keyof typeof kpiTones;

type Kpi = {
  label: string;
  value: string;
  detail: string;
  icon: keyof typeof kpiIcons;
  tone: KpiTone;
};

type Attention = {
  id: string | number;
  date: string;
  division: string;
  opponent: string;
  slots: string;
  urgent: boolean;
};

type ActivityItem = {
  id: string | number;
  text: string;
  time: string;
  tone: Tone;
};

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function opponentFromTitle(title: string) {
  const [home, away] = title.split(" vs ");
  if (!away) return title;
  return home.trim() === "BOB1" ? away.trim() : home.trim();
}

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: apiMatches } = useApiData<MatchDto[]>(() => api.matches.list(), []);
  const { data: apiUrgent } = useApiData<UrgentSlotDto[]>(() => api.slots.urgent(7), []);
  const { data: apiPenalties } = useApiData<PenaltyDto[]>(() => api.rankings.penalties(), []);

  const now = Date.now();
  const upcomingMatches = (apiMatches ?? []).filter(
        (match) => match.status === "Scheduled" && new Date(match.startsAtUtc).getTime() >= now,
      );
  const recentPenalties = (apiPenalties ?? []).filter((penalty) => now - new Date(penalty.createdAtUtc).getTime() <= WEEK_MS);

  const byMatch = new Map<string, { startsAt: string; title: string; missing: number }>();
  for (const slot of apiUrgent ?? []) {
    const entry = byMatch.get(slot.matchId) ?? {
      startsAt: slot.matchStartsAtUtc,
      title: slot.matchTitle,
      missing: 0,
    };
    entry.missing += slot.missing;
    byMatch.set(slot.matchId, entry);
  }

  const liveAttention: Attention[] = Array.from(byMatch.entries())
    .sort((a, b) => new Date(a[1].startsAt).getTime() - new Date(b[1].startsAt).getTime())
    .slice(0, 4)
    .map(([matchId, entry]) => {
      const match = apiMatches?.find((item) => item.id === matchId);
      const days = (new Date(entry.startsAt).getTime() - now) / (24 * 60 * 60 * 1000);
      return {
        id: matchId,
        date: formatDateTime(entry.startsAt),
        division: match?.divisionName ?? "—",
        opponent: match?.opponent ?? opponentFromTitle(entry.title),
        slots: `${entry.missing} poste${entry.missing > 1 ? "s" : ""}`,
        urgent: days <= 3,
      };
    });

  const openSlots = (apiUrgent ?? []).reduce((total, slot) => total + slot.missing, 0);

  const liveKpis: Kpi[] = [
    {
      label: "Matchs à venir",
      value: String(upcomingMatches.length),
      detail: "Sur les 120 prochains jours",
      icon: "calendar",
      tone: "success",
    },
    {
      label: "Postes non pourvus",
      value: String(openSlots),
      detail: openSlots > 0 ? "Action requise" : "Tout est pourvu",
      icon: "users",
      tone: openSlots > 0 ? "warning" : "success",
    },
    {
      label: "Pénalités récentes",
      value: String(recentPenalties.length),
      detail: "Cette semaine",
      icon: "shield",
      tone: recentPenalties.length > 0 ? "danger" : "neutral",
    },
  ];

  const liveActivity: ActivityItem[] = [
    ...recentPenalties.slice(0, 3).map((penalty) => ({
      id: penalty.id,
      text: `Pénalité de ${penalty.points} pts pour ${penalty.personName} : ${penalty.reason}`,
      time: formatDate(penalty.createdAtUtc),
      tone: "danger" as Tone,
    })),
    ...liveAttention.slice(0, 2).map((item) => ({
      id: `slot-${item.id}`,
      text: `${item.slots} non pourvu${item.slots.startsWith("1 ") ? "" : "s"} pour ${item.opponent}`,
      time: item.date,
      tone: "warning" as Tone,
    })),
  ].slice(0, 4);

  const kpis: Kpi[] = liveKpis;
  const attention: Attention[] = liveAttention;
  const activity: ActivityItem[] = liveActivity;

  const name = displayName(user);
  const firstName = name ? name.split(" ")[0] : "Camille";

  return (
    <>
      <PageHeader
        eyebrow="Vue d'ensemble"
        title={`Bonjour ${firstName}`}
        description="Voici ce qui se passe au club aujourd'hui."
      />

      <div id="tour-kpis" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpiIcons[kpi.icon];
          return (
            <Link
              key={kpi.label}
              href={kpiLinks[kpi.label] ?? "/matches"}
              className="group flex min-h-[132px] items-start gap-3.5 rounded-[17px] border border-line bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-brand/30"
            >
              <span className={cn("grid size-11 shrink-0 place-items-center rounded-[13px]", kpiTones[kpi.tone])}>
                <Icon size={20} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <small className="text-[12px] text-soft">{kpi.label}</small>
                <strong className="mt-1 font-display text-[30px] font-extrabold leading-none">{kpi.value}</strong>
                <b className="mt-2 text-[10.5px] font-medium text-soft">{kpi.detail}</b>
              </span>
              <ChevronRight size={17} className="mt-1 shrink-0 text-soft transition group-hover:translate-x-0.5" />
            </Link>
          );
        })}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-[1.45fr_0.8fr]">
        <Card id="tour-alerts" className="gap-0 py-0 shadow-soft">
          <CardHeading
            title="Matchs à compléter"
            subtitle="Postes encore non pourvus"
            action={
              <Link
                href="/matches"
                className="rounded-full px-3 py-2 text-[12px] font-bold text-brand transition hover:bg-brand-soft"
              >
                Voir tous
              </Link>
            }
          />
          <div>
            {attention.length === 0 && (
              <p className="px-5 py-8 text-center text-[11.5px] text-soft">
                Aucun poste non pourvu sur les prochains matchs.
              </p>
            )}
            {attention.map((match) => (
              <Link
                key={match.id}
                href="/matches"
                className="flex min-h-[72px] items-center gap-3 border-b border-line px-5 py-3 transition last:border-b-0 hover:bg-muted/40"
              >
                <span className={cn("size-2.5 shrink-0 rounded-full", match.urgent ? "bg-danger" : "bg-brand")} />
                <span className="flex min-w-0 flex-1 flex-col">
                  <strong className="truncate text-[12.5px]">
                    BOB1 <span className="font-medium text-soft">vs</span> {match.opponent}
                  </strong>
                  <small className="mt-1 text-[11px] text-soft">
                    {match.date} · {match.division}
                  </small>
                </span>
                <Status tone={match.urgent ? "danger" : "warning"}>{match.slots}</Status>
                <ChevronRight size={16} className="shrink-0 text-soft" />
              </Link>
            ))}
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-3">
            <span className="text-[11px] text-soft">
              {attention.length === 0
                ? "Aucun match ne nécessite votre attention cette semaine."
                : `${attention.length} match${attention.length > 1 ? "s" : ""} nécessite${attention.length > 1 ? "nt" : ""} votre attention cette semaine.`}
            </span>
            <Link href="/matches" className="flex items-center gap-1 text-[11px] font-bold text-brand">
              Gérer <ChevronRight size={14} />
            </Link>
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <div id="tour-calendar">
            <Card className="gap-0 py-0 shadow-soft">
              <CardHeading title="Prochains matchs" subtitle="Calendrier du club" />
              <div>
                {upcomingMatches.length === 0 && (
                  <p className="px-5 py-8 text-center text-[11.5px] text-soft">Aucun match à venir.</p>
                )}
                {upcomingMatches.slice(0, 4).map((match) => (
                  <Link
                    key={match.id}
                    href="/matches"
                    className="flex items-center gap-3 border-b border-line px-5 py-3 last:border-b-0 transition hover:bg-muted/40"
                  >
                    <span className="flex w-[52px] shrink-0 flex-col items-center rounded-lg bg-muted py-1.5">
                      <b className="text-[12px] font-extrabold leading-none">{formatDate(match.startsAtUtc)}</b>
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <strong className="truncate text-[12px]">{match.title}</strong>
                      <small className="mt-0.5 truncate text-[10.5px] text-soft">
                        {match.divisionName} · {match.venueName}
                      </small>
                    </span>
                  </Link>
                ))}
              </div>
            </Card>
          </div>
          <Card id="tour-activity" className="gap-0 py-0 shadow-soft">
            <CardHeading title="Activité récente" subtitle="Les dernières actions du club" />
            <div className="px-5 py-1">
              {activity.length === 0 && (
                <p className="py-6 text-center text-[11px] text-soft">Aucune activité récente.</p>
              )}
              {activity.map((item) => (
                <div key={item.id} className="flex items-start gap-3 border-b border-line py-3 last:border-b-0">
                  <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", dotTones[item.tone])} />
                  <span className="flex flex-col">
                    <span className="text-[11.5px] leading-snug">{item.text}</span>
                    <small className="mt-1 text-[10px] text-soft">{item.time}</small>
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
