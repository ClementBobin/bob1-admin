"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, ChevronRight, Clock, Plus, ShieldAlert, Users } from "lucide-react";
import { activity, attentionMatches, kpis } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Card, CardHeading, PageHeader, Status } from "@/components/ui";
import MiniCalendar from "@/components/mini-calendar";

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
  "Pénalités récentes": "/penalties",
};

export default function DashboardPage() {
  const router = useRouter();

  return (
    <>
      <PageHeader
        eyebrow="Vue d'ensemble"
        title="Bonjour Camille"
        description="Voici ce qui se passe au club aujourd'hui."
        action={{ label: "Créer un match", icon: Plus, onClick: () => router.push("/matches") }}
      />

      <div id="tour-kpis" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpiIcons[kpi.icon as keyof typeof kpiIcons];
          return (
            <Link
              key={kpi.label}
              href={kpiLinks[kpi.label]}
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
        <Card id="tour-alerts">
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
            {attentionMatches.map((match) => (
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
            <span className="text-[11px] text-soft">4 matchs nécessitent votre attention cette semaine.</span>
            <Link href="/matches" className="flex items-center gap-1 text-[11px] font-bold text-brand">
              Gérer <ChevronRight size={14} />
            </Link>
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <div id="tour-calendar">
            <MiniCalendar />
          </div>
          <Card id="tour-activity">
            <CardHeading title="Activité récente" subtitle="Les dernières actions du club" />
            <div className="px-5 py-1">
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
