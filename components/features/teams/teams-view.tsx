"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { api, errorMessage } from "@/lib/api";
import { FILTER_ALL, TEAM_STATUS_OPTIONS, statusTone } from "@/lib/constants";
import { fullName, matchesSearch } from "@/lib/utils";
import { useApiData } from "@/hooks/use-api-data";
import { useFormSheet } from "@/hooks/use-form-sheet";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/shared/data-table";
import { ErrorBanner } from "@/components/shared/error-banner";
import { Filters } from "@/components/shared/filters";
import { FormSheet, FormSheetFooter } from "@/components/shared/form-sheet";
import { RowActionButton } from "@/components/shared/row-action-button";
import { Status } from "@/components/shared/status";
import { TEAM_FORM_ID, TeamForm } from "./team-form";
import type { DivisionDto, PersonDto, TeamDto, TeamRow, VenueDto } from "@/types";

export function TeamsView() {
  const [rows, setRows] = useState<TeamRow[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(FILTER_ALL.statuses);
  const sheet = useFormSheet<TeamRow>();

  const { data: apiTeams, loading, error, reload } = useApiData<TeamDto[]>(() => api.teams.list(), []);
  const { data: apiDivisions } = useApiData<DivisionDto[]>(() => api.divisions.list(), []);
  const { data: apiVenues } = useApiData<VenueDto[]>(() => api.venues.list(), []);
  const { data: apiPeople } = useApiData<PersonDto[]>(
    async () => (await api.people.list({ take: 200 })).items,
    [],
  );

  const divisions = apiDivisions ?? [];
  const divisionOptions = divisions.map((division) => division.name);
  const venueOptions = (apiVenues ?? []).map((v) => ({ id: v.id, name: v.name }));
  const staffOptions = (apiPeople ?? []).filter((p) => p.roles.includes("Staff")).map((p) => ({ id: p.id, name: fullName(p.firstName, p.lastName) }));

  useEffect(() => {
    const names = new Map(divisions.map((division) => [division.id, division.name]));
    const venueNames = new Map((apiVenues ?? []).map((v) => [v.id, v.name]));
    setRows(
      (apiTeams ?? []).map((team) => ({
        id: team.id,
        name: team.name,
        division: names.get(team.divisionId) ?? "—",
        coach: team.coachName ?? "—",
        coachUserId: team.coachUserId ?? null,
        logo: team.logoUrl ?? null,
        players: "—",
        status: team.isActive ? "Active" : "Archivée",
        trainingVenueId: team.trainingVenueId ?? null,
        trainingVenueName: team.trainingVenueName ?? (team.trainingVenueId ? venueNames.get(team.trainingVenueId) ?? null : null),
      })),
    );
  }, [apiTeams, apiDivisions, apiVenues]);

  const filtered = useMemo(
    () =>
      rows.filter(
        (row) =>
          matchesSearch(search, row.name, row.division, row.coach, row.trainingVenueName) &&
          (status === FILTER_ALL.statuses || row.status === status),
      ),
    [rows, search, status],
  );

  const save = async (row: TeamRow) => {
    const division = (apiDivisions ?? []).find((item) => item.name === row.division);
    if (!division) {
      toast.error("Sélectionnez une division existante.");
      return;
    }

    try {
      const teamData = {
        name: row.name,
        divisionId: division.id,
        coachName: row.coach === "À désigner" ? undefined : row.coach,
        coachUserId: row.coachUserId || undefined,
        logoUrl: row.logo || undefined,
        isActive: row.status === "Active",
        trainingVenueId: row.trainingVenueId || undefined,
      };
      if (sheet.editing) await api.teams.update(row.id, teamData);
      else await api.teams.create(teamData);
      await reload();
      toast.success(sheet.editing ? "L'équipe a été mise à jour." : "L'équipe a été créée.");
      sheet.close();
    } catch (cause) {
      toast.error(errorMessage(cause));
    }
  };

  return (
    <>
      <PageHeader
        id="tour-teams-header"
        eyebrow="Référentiels"
        title="Équipes"
        description="Gérez les équipes, coachs, logos et lieux d'entraînement."
        action={{ label: "Créer une équipe", icon: Plus, onClick: sheet.openCreate }}
      />

      <Filters
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Rechercher une équipe, un coach, un lieu…"
        selects={[
          {
            label: "Statut",
            value: status,
            options: [FILTER_ALL.statuses, ...TEAM_STATUS_OPTIONS],
            onChange: setStatus,
          },
        ]}
        onReset={() => {
          setSearch("");
          setStatus(FILTER_ALL.statuses);
        }}
      />

      <ErrorBanner message={error} />

      <DataTable
        id="tour-teams-table"
        rows={filtered}
        rowKey={(row) => row.id}
        minWidth={1000}
        grid="1.5fr 1fr 1.2fr 1fr .9fr 36px"
        emptyMessage={loading ? "Chargement des équipes…" : undefined}
        columns={[
          {
            key: "name",
            label: "Équipe",
            render: (row) => (
              <span className="flex items-center gap-2.5">
                {row.logo ? (
                  <img src={row.logo} alt={row.name} className="size-8 shrink-0 rounded-[9px] object-contain" />
                ) : (
                  <span className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-green text-[9px] font-extrabold text-brand-foreground">
                    {row.name
                      .split(" ")
                      .slice(0, 2)
                      .map((part) => part[0])
                      .join("")}
                  </span>
                )}
                <strong className="truncate">{row.name}</strong>
              </span>
            ),
          },
          {
            key: "division",
            label: "Division",
            render: (row) => (
              <span className="rounded-full bg-mint px-2.5 py-1 text-[10.5px] font-bold text-mint-foreground">
                {row.division}
              </span>
            ),
          },
          { key: "coach", label: "Coach", render: (row) => row.coach },
          {
            key: "trainingVenueName",
            label: "Lieu d'entraînement",
            render: (row) => row.trainingVenueName ?? <span className="text-soft">—</span>,
          },
          {
            key: "status",
            label: "Statut",
            render: (row) => (
              <Status tone={statusTone(row.status, "neutral")}>{row.status}</Status>
            ),
          },
          {
            key: "actions",
            label: "",
            render: (row) => <RowActionButton onClick={() => sheet.openEdit(row)} />,
          },
        ]}
      />

      <FormSheet
        open={sheet.open}
        onClose={sheet.close}
        title={sheet.editing ? "Modifier l'équipe" : "Créer une équipe"}
        subtitle="Identité et encadrement"
        footer={
          <FormSheetFooter
            onCancel={sheet.close}
            submitLabel={sheet.editing ? "Enregistrer" : "Créer l'équipe"}
            form={TEAM_FORM_ID}
          />
        }
      >
        {sheet.open && (
          <TeamForm
            key={sheet.editing?.id ?? "new"}
            row={sheet.editing}
            divisionOptions={divisionOptions}
            venueOptions={venueOptions}
            staffOptions={staffOptions}
            onSave={save}
          />
        )}
      </FormSheet>
    </>
  );
}
