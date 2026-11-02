"use client";

import { useMemo, useState } from "react";
import { MoreHorizontal, Plus } from "lucide-react";
import { divisions } from "@/lib/data";
import { useToast } from "@/components/toast";
import {
  Button,
  DataTable,
  Drawer,
  DrawerFooter,
  Filters,
  FormField,
  PageHeader,
  SelectInput,
  Status,
  TextInput,
} from "@/components/ui";

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

function Form({
  row,
  onSave,
}: {
  row: DivisionRow | null;
  onSave: (row: DivisionRow) => void;
}) {
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
        <FormField label="Nom" wide>
          <TextInput value={name} onChange={(event) => setName(event.target.value)} required />
        </FormField>
        <FormField label="Catégorie">
          <SelectInput value={category} onChange={(event) => setCategory(event.target.value)} options={["U11", "U13", "U15", "U17", "U18", "Senior"]} />
        </FormField>
        <FormField label="Genre">
          <SelectInput value={gender} onChange={(event) => setGender(event.target.value)} options={["Masculin", "Féminin", "Mixte"]} />
        </FormField>
        <FormField label="Statut">
          <SelectInput value={status} onChange={(event) => setStatus(event.target.value)} options={["Active", "Archivée"]} />
        </FormField>
      </div>
    </form>
  );
}

export default function DivisionsPage() {
  const [rows, setRows] = useState<DivisionRow[]>(initial);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<DivisionRow | null>(null);
  const { toast } = useToast();

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

  const save = (row: DivisionRow) => {
    if (editing) {
      setRows((current) => current.map((item) => (item.id === row.id ? row : item)));
      toast("La division a été mise à jour.");
    } else {
      setRows((current) => [row, ...current]);
      toast("La division a été créée.");
    }
    setDrawerOpen(false);
    setEditing(null);
  };

  return (
    <>
      <PageHeader
        id="tour-divisions-header"
        eyebrow="Référentiels"
        title="Divisions"
        description="Structurez les catégories du club."
        action={{ label: "Créer une division", icon: Plus, onClick: openCreate }}
      />

      <Filters
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Rechercher une division…"
        onReset={() => setSearch("")}
      />

      <DataTable
        id="tour-divisions-table"
        rows={filtered}
        rowKey={(row) => row.id}
        minWidth={760}
        grid="1.4fr 1fr 1fr 1fr .8fr 36px"
        columns={[
          { key: "name", label: "Nom", render: (row) => <strong>{row.name}</strong> },
          { key: "category", label: "Catégorie", render: (row) => row.category },
          { key: "gender", label: "Genre", render: (row) => row.gender },
          { key: "teams", label: "Équipes", render: (row) => row.teams },
          { key: "status", label: "Statut", render: (row) => <Status tone={statusTone(row.status)}>{row.status}</Status> },
          {
            key: "actions",
            label: "",
            render: (row) => (
              <button onClick={() => openEdit(row)} aria-label="Modifier" className="grid size-8 place-items-center rounded-lg text-soft transition hover:bg-muted">
                <MoreHorizontal size={16} />
              </button>
            ),
          },
        ]}
      />

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editing ? "Modifier la division" : "Créer une division"}
        subtitle="Informations générales"
        footer={
          <DrawerFooter
            onCancel={() => setDrawerOpen(false)}
            submitLabel={editing ? "Enregistrer" : "Créer la division"}
            form="division-form"
          />
        }
      >
        {drawerOpen && <Form key={editing?.id ?? "new"} row={editing} onSave={save} />}
      </Drawer>
    </>
  );
}
