"use client";

import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useApiData } from "@/hooks/use-api-data";
import { useSeason } from "@/components/season/season-provider";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/shared/data-table";
import { ErrorBanner } from "@/components/shared/error-banner";
import { Status } from "@/components/shared/status";
import { RowActionButton } from "@/components/shared/row-action-button";
import type { SeasonOverview } from "@/types";

const formatDate = (iso: string) => new Date(iso).toLocaleDateString("fr-FR");

export function SeasonsView() {
  const router = useRouter();
  const { setSeason } = useSeason();
  const { data, loading, error } = useApiData<SeasonOverview[]>(() => api.seasons.overview(), []);

  const open = (row: SeasonOverview) => {
    setSeason(row.label);
    router.push("/matches");
  };

  return (
    <>
      <PageHeader
        eyebrow="Organisation"
        title="Saisons"
        description="Une saison court du 1er septembre au 31 août. Les saisons passées sont en lecture seule : ouvrez-en une pour consulter ses matchs, points et joueurs."
      />
      <ErrorBanner message={error} />
      <DataTable
        rows={data ?? []}
        rowKey={(row) => row.label}
        pageSize={12}
        minWidth={900}
        emptyMessage={loading ? "Chargement des saisons…" : undefined}
        columns={[
          {
            key: "season",
            label: "Saison",
            render: (row) => (
              <span className="flex flex-col">
                <strong>{row.label}</strong>
                <small className="text-muted-foreground">
                  {formatDate(row.startsOn)} – {formatDate(row.endsOn)}
                </small>
              </span>
            ),
          },
          {
            key: "state",
            label: "État",
            render: (row) => <Status tone={row.isCurrent ? "success" : "info"}>{row.isCurrent ? "En cours" : "Terminée"}</Status>,
          },
          {
            key: "players",
            label: "Joueurs",
            render: (row) => (
              <span className="flex flex-col">
                <strong>{row.players}</strong>
                <small className="text-muted-foreground">
                  {row.playersByDivision.map((d) => `${d.divisionName} ${d.players}`).join(" · ") || "—"}
                </small>
              </span>
            ),
          },
          {
            key: "matches",
            label: "Matchs",
            render: (row) => (
              <span className="flex flex-col">
                <strong>{row.matchesTotal}</strong>
                <small className="text-muted-foreground">
                  {row.matchesPlayed} joués · {row.matchesCancelled} annulés
                </small>
              </span>
            ),
          },
          {
            key: "points",
            label: "Points",
            render: (row) => (
              <span className="flex flex-col">
                <strong>
                  +{row.pointsAwarded} / {row.pointsRemoved}
                </strong>
                <small className="text-muted-foreground">
                  {row.pointEntries} écritures · {row.manualAdjustments} manuelles
                </small>
              </span>
            ),
          },
          {
            key: "actions",
            label: "",
            render: (row) => <RowActionButton label="Ouvrir la saison" onClick={() => open(row)} />,
          },
        ]}
      />
    </>
  );
}
