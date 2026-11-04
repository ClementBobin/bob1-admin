"use client";

import { useEffect, useMemo, useState } from "react";
import { MoreHorizontal, Plus, Shield } from "lucide-react";
import { divisions } from "@/lib/data";
import { divisionToRow, teamCountByDivision } from "@/lib/adapters";
import { api, errorMessage, USE_MOCK, type DivisionDto, type TeamDto } from "@/lib/api";
import { useApiData } from "@/lib/use-api-data";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { OptionSelect } from "@/components/option-select";
import { Status } from "@/components/status";
import { DataTable } from "@/components/data-table";
import { Filters } from "@/components/filters";
import { PageHeader } from "@/components/page-header";
import { FormSheet, FormSheetFooter } from "@/components/form-sheet";

type DivisionRow = {
  id: string;
  name: string;
  category: string;
  gender: string;
  teams: string;
  status: string;
};

const initial: DivisionRow[] = divisions.map((item) => ({ ...item }));

const statusTone = (status: string) => (status === "Active" ? ("success" as const) : ("neutral" as const));
const categoryOptions = ["U11", "U13", "U15", "U17", "U18", "Senior"];
const genderOptions = ["Masculin", "Féminin", "Mixte"];
const statusOptions = ["Active", "Inactive"];

function Form({ row, onSave }: { row: DivisionRow | null; onSave: (row: DivisionRow) => void }) {
  const [name, setName] = useState(row?.name ?? "U18 Masculins");
  const [category, setCategory] = useState(row?.category ?? "U18");
  const [gender, setGender] = useState(row?.gender ?? "Masculin");
  const [status, setStatus] = useState(row?.status ?? "Active");

  return (
    <form
      id="division-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSave({
          id: row?.id ?? `d${Date.now()}`,
          name,
          category,
          gender,
          teams: row?.teams ?? "0 équipe",
          status,
        });
      }}
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <Field className="col-span-full">
          <FieldLabel htmlFor="divisions-field-1" className="text-[11px] font-bold text-muted-foreground">
            Nom
          </FieldLabel>
          <Input id="divisions-field-1" value={name} onChange={(event) => setName(event.target.value)} required />
        </Field>
        <Field>
          <FieldLabel htmlFor="divisions-field-2" className="text-[11px] font-bold text-muted-foreground">
            Catégorie
          </FieldLabel>
          <OptionSelect id="divisions-field-2" value={category} onValueChange={setCategory} options={categoryOptions} />
        </Field>
        <Field>
          <FieldLabel htmlFor="divisions-field-3" className="text-[11px] font-bold text-muted-foreground">
            Genre
          </FieldLabel>
          <OptionSelect id="divisions-field-3" value={gender} onValueChange={setGender} options={genderOptions} />
        </Field>
        <Field>
          <FieldLabel htmlFor="divisions-field-4" className="text-[11px] font-bold text-muted-foreground">
            Statut
          </FieldLabel>
          <OptionSelect id="divisions-field-4" value={status} onValueChange={setStatus} options={statusOptions} />
        </Field>
      </div>
    </form>
  );
}

export default function DivisionsPage() {
  const [rows, setRows] = useState<DivisionRow[]>(USE_MOCK ? initial : []);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<DivisionRow | null>(null);

  const { data: apiDivisions, loading, error, reload } = useApiData<DivisionDto[]>(() => api.divisions.list(), []);
  const { data: apiTeams } = useApiData<TeamDto[]>(() => api.teams.list(), []);

  useEffect(() => {
    if (USE_MOCK) return;
    const counts = teamCountByDivision(apiTeams);
    setRows(apiDivisions.map((division) => divisionToRow(division, counts.get(division.id) ?? 0)));
  }, [apiDivisions, apiTeams]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return rows.filter((row) => `${row.name} ${row.category} ${row.gender}`.toLowerCase().includes(needle));
  }, [rows, search]);

  const openCreate = () => {
    setEditing(null);
    setDrawerOpen(true);
  };

  const openEdit = (row: DivisionRow) => {
    setEditing(row);
    setDrawerOpen(true);
  };

  const save = async (row: DivisionRow) => {
    if (USE_MOCK) {
      if (editing) {
        setRows((current) => current.map((item) => (item.id === row.id ? row : item)));
        toast.success("La division a été mise à jour.");
      } else {
        setRows((current) => [row, ...current]);
        toast.success("La division a été créée.");
      }
      setDrawerOpen(false);
      setEditing(null);
      return;
    }

    try {
      if (editing)
        await api.divisions.update(row.id, {
          name: row.name,
          sortOrder: 0,
          category: row.category,
          gender: row.gender,
          isActive: row.status === "Active",
        });
      else
        await api.divisions.create({
          name: row.name,
          sortOrder: 0,
          category: row.category,
          gender: row.gender,
          isActive: row.status === "Active",
        });
      await reload();
      toast.success(editing ? "La division a été mise à jour." : "La division a été créée.");
      setDrawerOpen(false);
      setEditing(null);
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
        action={{ label: "Créer une division", icon: Plus, onClick: openCreate }}
      />

      <Filters
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Rechercher une division…"
        onReset={() => setSearch("")}
      />

      {!USE_MOCK && error && (
        <div className="mb-4 rounded-xl bg-danger-soft px-4 py-3 text-[12px] font-medium text-danger">{error}</div>
      )}

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
            render: (row) => <Status tone={statusTone(row.status)}>{row.status}</Status>,
          },
          {
            key: "actions",
            label: "",
            render: (row) => (
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground"
                onClick={() => openEdit(row)}
                aria-label="Modifier"
              >
                <MoreHorizontal size={16} />
              </Button>
            ),
          },
        ]}
      />

      <FormSheet
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editing ? "Modifier la division" : "Créer une division"}
        subtitle="Informations générales"
        footer={
          <FormSheetFooter
            onCancel={() => setDrawerOpen(false)}
            submitLabel={editing ? "Enregistrer" : "Créer la division"}
            form="division-form"
          />
        }
      >
        {drawerOpen && <Form key={editing?.id ?? "new"} row={editing} onSave={save} />}
      </FormSheet>
    </>
  );
}
