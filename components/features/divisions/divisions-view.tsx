"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { divisionToRow, teamCountByDivision } from "@/lib/adapters";
import { api, errorMessage } from "@/lib/api";
import { statusTone } from "@/lib/constants";
import { matchesSearch } from "@/lib/utils";
import { useApiData } from "@/hooks/use-api-data";
import { useFormSheet } from "@/hooks/use-form-sheet";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/shared/data-table";
import { ErrorBanner } from "@/components/shared/error-banner";
import { Filters } from "@/components/shared/filters";
import { FormSheet, FormSheetFooter } from "@/components/shared/form-sheet";
import { RowActionButton } from "@/components/shared/row-action-button";
import { Status } from "@/components/shared/status";
import { DIVISION_FORM_ID, DivisionForm } from "./division-form";
import type { DivisionDto, DivisionRow, TeamDto } from "@/types";

export function DivisionsView() {
  const [rows, setRows] = useState<DivisionRow[]>([]);
  const [search, setSearch] = useState("");
  const sheet = useFormSheet<DivisionRow>();

  const { data: apiDivisions, loading, error, reload } = useApiData<DivisionDto[]>(() => api.divisions.list(), []);
  const { data: apiTeams } = useApiData<TeamDto[]>(() => api.teams.list());

  useEffect(() => {
    const counts = teamCountByDivision(apiTeams ?? []);
    setRows((apiDivisions ?? []).map((division) => divisionToRow(division, counts.get(division.id))));
  }, [apiDivisions, apiTeams]);

  const filtered = useMemo(
    () => rows.filter((row) => matchesSearch(search, row.name, row.category, row.gender)),
    [rows, search],
  );

  const save = async (row: DivisionRow) => {
    const payload = {
      name: row.name,
      sortOrder: 0,
      category: row.category ?? "",
      gender: row.gender ?? "",
      isActive: row.status === "Active",
    };
    try {
      if (sheet.editing) await api.divisions.update(row.id, payload);
      else await api.divisions.create(payload);
      await reload();
      toast.success(sheet.editing ? "La division a été mise à jour." : "La division a été créée.");
      sheet.close();
    } catch (cause) {
      toast.error(errorMessage(cause));
    }
  };

  return (
    <>
      <PageHeader
        id="tour-divisions-header"
        eyebrow="Référentiels"
        title="Divisions"
        description="Structurez les catégories du club (nom, catégorie, genre, statut)."
        action={{ label: "Créer une division", icon: Plus, onClick: sheet.openCreate }}
      />

      <Filters
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Rechercher une division…"
        onReset={() => setSearch("")}
      />

      <ErrorBanner message={error} />

      <DataTable
        id="tour-divisions-table"
        rows={filtered}
        rowKey={(row) => row.id}
        minWidth={760}
        grid="1.4fr 1fr 1fr 1fr .8fr 36px"
        emptyMessage={loading ? "Chargement des divisions…" : undefined}
        columns={[
          { key: "name", label: "Nom", render: (row) => <strong>{row.name}</strong> },
          { key: "category", label: "Catégorie", render: (row) => row.category },
          { key: "gender", label: "Genre", render: (row) => row.gender },
          { key: "teams", label: "Équipes", render: (row) => row.teams },
          {
            key: "status",
            label: "Statut",
            render: (row) => <Status tone={statusTone(row.status, "neutral")}>{row.status}</Status>,
          },
          { key: "actions", label: "", render: (row) => <RowActionButton onClick={() => sheet.openEdit(row)} /> },
        ]}
      />

      <FormSheet
        open={sheet.open}
        onClose={sheet.close}
        title={sheet.editing ? "Modifier la division" : "Créer une division"}
        subtitle="Informations générales"
        footer={
          <FormSheetFooter
            onCancel={sheet.close}
            submitLabel={sheet.editing ? "Enregistrer" : "Créer la division"}
            form={DIVISION_FORM_ID}
          />
        }
      >
        {sheet.open && <DivisionForm key={sheet.editing?.id ?? "new"} row={sheet.editing} onSave={save} />}
      </FormSheet>
    </>
  );
}
