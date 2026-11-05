"use client";

import { useEffect, useMemo, useState } from "react";
import { MapPin, Plus } from "lucide-react";
import { toast } from "sonner";
import { api, errorMessage } from "@/lib/api";
import { matchesSearch } from "@/lib/utils";
import { useApiData } from "@/hooks/use-api-data";
import { useFormSheet } from "@/hooks/use-form-sheet";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/shared/data-table";
import { ErrorBanner } from "@/components/shared/error-banner";
import { Filters } from "@/components/shared/filters";
import { FormSheet, FormSheetFooter } from "@/components/shared/form-sheet";
import { RowActionButton } from "@/components/shared/row-action-button";
import { VENUE_FORM_ID, VenueForm } from "./venue-form";
import type { VenueDto, VenueRow } from "@/types";

export function VenuesView() {
  const [rows, setRows] = useState<VenueRow[]>([]);
  const [search, setSearch] = useState("");
  const sheet = useFormSheet<VenueRow>();

  const { data: apiVenues, loading, error, reload } = useApiData<VenueDto[]>(() => api.venues.list(), []);

  useEffect(() => {
    setRows(
      (apiVenues ?? []).map((venue) => ({
        id: venue.id,
        name: venue.name,
        address: venue.address ?? "—",
        city: venue.city ?? "—",
        postalCode: venue.postalCode ?? "—",
        matches: "—",
      })),
    );
  }, [apiVenues]);

  const filtered = useMemo(
    () => rows.filter((row) => matchesSearch(search, row.name, row.address, row.city, row.postalCode)),
    [rows, search],
  );

  const save = async (row: VenueRow) => {
    const address = row.address.trim() === "" || row.address === "—" ? null : row.address.trim();
    const city = row.city.trim() === "" || row.city === "—" ? null : row.city.trim();
    const postalCode = row.postalCode.trim() === "" || row.postalCode === "—" ? null : row.postalCode.trim();
    try {
      if (sheet.editing) await api.venues.update(row.id, { name: row.name, address, city, postalCode });
      else await api.venues.create({ name: row.name, address, city, postalCode });
      await reload();
      toast.success(sheet.editing ? "Le lieu a été mis à jour." : "Le lieu a été ajouté.");
      sheet.close();
    } catch (cause) {
      toast.error(errorMessage(cause));
    }
  };

  return (
    <>
      <PageHeader
        id="tour-venues-header"
        eyebrow="Référentiels"
        title="Lieux"
        description="Centralisez les gymnases et adresses avec ville et code postal."
        action={{ label: "Ajouter un lieu", icon: Plus, onClick: sheet.openCreate }}
      />

      <Filters
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Rechercher un gymnase, une ville, un code postal…"
        onReset={() => setSearch("")}
      />

      <ErrorBanner message={error} />

      <DataTable
        id="tour-venues-table"
        rows={filtered}
        rowKey={(row) => row.id}
        minWidth={900}
        grid="1.3fr 1.3fr 1fr .8fr .8fr 36px"
        emptyMessage={loading ? "Chargement des lieux…" : undefined}
        columns={[
          {
            key: "name",
            label: "Nom",
            render: (row) => (
              <span className="flex items-center gap-2.5">
                <MapPin size={16} className="shrink-0 text-soft" />
                <strong className="truncate">{row.name}</strong>
              </span>
            ),
          },
          { key: "address", label: "Adresse", render: (row) => row.address },
          {
            key: "city",
            label: "Ville / CP",
            render: (row) => `${row.city} ${row.postalCode !== "—" ? row.postalCode : ""}`.trim(),
          },
          { key: "matches", label: "Matchs à venir", render: (row) => row.matches },
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
        title={sheet.editing ? "Modifier le lieu" : "Ajouter un lieu"}
        subtitle="Adresse et géolocalisation"
        footer={
          <FormSheetFooter
            onCancel={sheet.close}
            submitLabel={sheet.editing ? "Enregistrer" : "Ajouter le lieu"}
            form={VENUE_FORM_ID}
          />
        }
      >
        {sheet.open && <VenueForm key={sheet.editing?.id ?? "new"} row={sheet.editing} onSave={save} />}
      </FormSheet>
    </>
  );
}
