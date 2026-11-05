"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { matchToRow } from "@/lib/adapters";
import { api, errorMessage } from "@/lib/api";
import {
  FILTER_ALL,
  MATCH_STATUS_OPTIONS,
  SLOT_SPECS,
  statusTone,
} from "@/lib/constants";
import { cn, matchesSearch } from "@/lib/utils";
import { useApiData } from "@/hooks/use-api-data";
import { useFormSheet } from "@/hooks/use-form-sheet";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/shared/data-table";
import { ErrorBanner } from "@/components/shared/error-banner";
import { FillMeter } from "@/components/shared/fill-meter";
import { Filters } from "@/components/shared/filters";
import { FormSheet, FormSheetFooter } from "@/components/shared/form-sheet";
import { RowActionButton } from "@/components/shared/row-action-button";
import { Status } from "@/components/shared/status";
import { MATCH_FORM_ID, MatchForm } from "./match-form";
import type {
  DivisionDto,
  MatchDto,
  MatchPayload,
  MatchRow,
  NamedOption,
  VenueDto,
} from "@/types";

export function MatchesView() {
  const [rows, setRows] = useState<MatchRow[]>([]);
  const [search, setSearch] = useState("");
  const [division, setDivision] = useState(FILTER_ALL.divisions);
  const [status, setStatus] = useState(FILTER_ALL.statuses);
  const sheet = useFormSheet<MatchRow>();
  const editing = sheet.editing;
  const [saving, setSaving] = useState(false);

  const {
    data: apiMatches,
    loading,
    error,
    reload,
  } = useApiData<MatchDto[]>(() => api.matches.list(), []);
  const { data: apiDivisions } = useApiData<DivisionDto[]>(
    () => api.divisions.list(),
    [],
  );
  const { data: apiVenues } = useApiData<VenueDto[]>(
    () => api.venues.list(),
    [],
  );

  useEffect(() => {
    setRows(
      (apiMatches ?? []).map((match) => ({
        ...matchToRow(match),
        opponent: match.opponent,
        isHome: match.isHome,
        startsAtUtc: match.startsAtUtc,
      })),
    );
  }, [apiMatches]);

  const divisionOptions: NamedOption[] = (apiDivisions ?? []).map((item) => ({
    id: item.id,
    name: item.name,
  }));

  const venueOptions: NamedOption[] = (apiVenues ?? []).map((item) => ({
    id: item.id,
    name: item.name,
  }));

  const divisionNames = useMemo(() => {
    const names = divisionOptions.map((item) => item.name);
    if (editing && !names.includes(editing.division))
      return [editing.division, ...names];
    return names;
  }, [divisionOptions, editing]);

  const venueNames = useMemo(() => {
    const names = venueOptions.map((item) => item.name);
    if (editing && !names.includes(editing.venue))
      return [editing.venue, ...names];
    return names;
  }, [venueOptions, editing]);

  const statusOptions = [FILTER_ALL.statuses, ...MATCH_STATUS_OPTIONS];

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      const matchSearch = matchesSearch(
        search,
        row.home,
        row.away,
        row.division,
        row.venue,
        row.date,
      );
      const matchDivision =
        division === FILTER_ALL.divisions || row.division === division;
      const matchStatus =
        status === FILTER_ALL.statuses || row.status === status;
      return matchSearch && matchDivision && matchStatus;
    });
  }, [rows, search, division, status]);

  const save = async (payload: MatchPayload) => {
    const divisionId = divisionOptions.find(
      (item) => item.name === payload.divisionName,
    )?.id;
    const venueId = venueOptions.find(
      (item) => item.name === payload.venueName,
    )?.id;
    if (!divisionId || !venueId) {
      toast.error("Sélectionnez une division et un lieu existants.");
      return;
    }

    const input = {
      divisionId,
      opponent: payload.opponent,
      isHome: payload.isHome,
      venueId,
      startsAtUtc: new Date(`${payload.date}T${payload.time}:00`).toISOString(),
    };

    setSaving(true);
    try {
      if (editing) {
        await api.matches.update(editing.id, input);
        toast.success("Le match a été mis à jour.");
      } else {
        const created = await api.matches.create(input);
        const failures: string[] = [];
        for (const spec of SLOT_SPECS) {
          const capacity = payload.slots[spec.key] ?? 0;
          if (capacity <= 0) continue;
          try {
            await api.slots.create(created.id, {
              kind: spec.kind,
              role: spec.label,
              capacity,
            });
          } catch {
            failures.push(spec.label);
          }
        }
        (failures.length ? toast.error : toast.success)(
          failures.length
            ? `Le match a été créé, mais les postes suivants n'ont pas pu être ajoutés : ${failures.join(", ")}.`
            : "Le match a été créé et publié au calendrier.",
        );
      }
      await reload();
      sheet.close();
    } catch (cause) {
      toast.error(errorMessage(cause));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        id="tour-matches-header"
        eyebrow="Organisation"
        title="Matchs"
        description="Planifiez les rencontres et suivez les besoins du club."
        action={{
          label: "Créer un match",
          icon: Plus,
          onClick: sheet.openCreate,
        }}
      />

      <Filters
        id="tour-matches-filters"
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Rechercher un match, une équipe…"
        selects={[
          {
            label: "Division",
            value: division,
            options: [FILTER_ALL.divisions, ...divisionNames],
            onChange: setDivision,
          },
          {
            label: "Statut",
            value: status,
            options: statusOptions,
            onChange: setStatus,
          },
        ]}
        onReset={() => {
          setSearch("");
          setDivision(FILTER_ALL.divisions);
          setStatus(FILTER_ALL.statuses);
        }}
      />

      <ErrorBanner message={error} />

      <DataTable
        id="tour-matches-table"
        rows={filtered}
        rowKey={(row) => row.id}
        minWidth={1060}
        grid="1.1fr .65fr 1.4fr 1.1fr .9fr .9fr 1fr .8fr 36px"
        emptyMessage={
          loading
            ? "Chargement des matchs…"
            : "Modifiez vos filtres ou créez un nouveau match pour le voir apparaître ici."
        }
        columns={[
          {
            key: "date",
            label: "Date",
            render: (row) => (
              <strong className="text-[12.5px] font-bold">{row.date}</strong>
            ),
          },
          {
            key: "division",
            label: "Division",
            render: (row) => (
              <span className="inline-flex w-fit rounded-full bg-mint px-2.5 py-1 text-[10.5px] font-bold text-mint-foreground">
                {row.division}
              </span>
            ),
          },
          {
            key: "teams",
            label: "Équipes",
            render: (row) => (
              <strong className="truncate text-[12.5px]">
                {row.home} <span className="font-medium text-soft">—</span>{" "}
                {row.away}
              </strong>
            ),
          },
          {
            key: "venue",
            label: "Lieu",
            render: (row) => <span className="truncate">{row.venue}</span>,
          },
          {
            key: "officials",
            label: "Officiels",
            render: (row) => (
              <FillMeter value={row.officials[0]} total={row.officials[1]} />
            ),
          },
          {
            key: "buvette",
            label: "Buvette",
            render: (row) => (
              <FillMeter value={row.buvette[0]} total={row.buvette[1]} />
            ),
          },
          {
            key: "carpool",
            label: "Covoiturage",
            render: (row) => (
              <span
                className={cn(
                  "text-[11.5px]",
                  row.carpool === "Complet"
                    ? "font-bold text-green"
                    : "text-soft",
                )}
              >
                {row.carpool}
              </span>
            ),
          },
          {
            key: "status",
            label: "Statut",
            render: (row) => (
              <Status tone={statusTone(row.status)}>{row.status}</Status>
            ),
          },
          {
            key: "actions",
            label: "",
            render: (row) => (
              <RowActionButton
                onClick={() => sheet.openEdit(row)}
                label={`Modifier le match ${row.home} — ${row.away}`}
              />
            ),
          },
        ]}
      />

      <FormSheet
        open={sheet.open}
        onClose={sheet.close}
        title={editing ? "Modifier le match" : "Créer un match"}
        subtitle={
          editing ? `${editing.home} — ${editing.away}` : "Nouvelle rencontre"
        }
        footer={
          <FormSheetFooter
            onCancel={sheet.close}
            submitLabel={
              saving
                ? "Enregistrement…"
                : editing
                  ? "Enregistrer les modifications"
                  : "Créer le match"
            }
            form={MATCH_FORM_ID}
          />
        }
      >
        {sheet.open && (
          <MatchForm
            key={editing?.id ?? "new"}
            match={editing}
            divisionOptions={divisionNames}
            venueOptions={venueNames}
            onSave={save}
          />
        )}
      </FormSheet>
    </>
  );
}
