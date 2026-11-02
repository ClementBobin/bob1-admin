"use client";

import { useMemo, useState } from "react";
import { MoreHorizontal, Plus, Upload } from "lucide-react";
import { teams } from "@/lib/data";
import { useToast } from "@/components/toast";
import {
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

type TeamRow = {
  id: string;
  name: string;
  division: string;
  coach: string;
  players: string;
  status: string;
};

const initial: TeamRow[] = teams.map((item) => ({ ...item }));
const divisionOptions = ["U13 M", "U13 F", "U15 M", "U15 F", "U17 M", "U17 F", "Seniors M", "Seniors F"];

function Form({ row, onSave }: { row: TeamRow | null; onSave: (row: TeamRow) => void }) {
  const [name, setName] = useState(row?.name ?? "BOB1 U18 M");
  const [division, setDivision] = useState(row?.division ?? "U17 M");
  const [coach, setCoach] = useState(row?.coach ?? "");
  const [status, setStatus] = useState(row?.status ?? "Active");
  const [logo, setLogo] = useState("");

  return (
    <form
      id="team-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSave({
          id: row?.id ?? `t${Date.now()}`,
          name,
          division,
          coach: coach || "À désigner",
          players: row?.players ?? "0 joueur",
          status,
        });
      }}
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <FormField label="Nom de l'équipe" wide>
          <TextInput value={name} onChange={(event) => setName(event.target.value)} required />
        </FormField>
        <FormField label="Division">
          <SelectInput value={division} onChange={(event) => setDivision(event.target.value)} options={divisionOptions} />
        </FormField>
        <FormField label="Coach">
          <TextInput
            value={coach}
            onChange={(event) => setCoach(event.target.value)}
            placeholder="Nom du coach"
          />
        </FormField>
        <FormField label="Statut" wide>
          <SelectInput value={status} onChange={(event) => setStatus(event.target.value)} options={["Active", "Externe", "Archivée"]} />
        </FormField>
      </div>

      <div>
        <span className="mb-1.5 block text-[11px] font-bold text-soft">Logo de l&apos;équipe</span>
        <label className="flex min-h-[112px] cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-line px-4 text-center transition hover:bg-muted/50">
          <input
            type="file"
            accept="image/png,image/svg+xml"
            className="sr-only"
            onChange={(event) => setLogo(event.target.files?.[0]?.name ?? "")}
          />
          <span className="grid size-9 place-items-center rounded-xl bg-muted text-soft">
            <Upload size={18} />
          </span>
          <strong className="mt-1 text-[12px]">{logo || "Importer un logo"}</strong>
          <small className="text-[10px] text-soft">PNG ou SVG · 2 Mo max.</small>
        </label>
      </div>
    </form>
  );
}

export default function TeamsPage() {
  const [rows, setRows] = useState<TeamRow[]>(initial);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Tous les statuts");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<TeamRow | null>(null);
  const { toast } = useToast();

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchSearch = `${row.name} ${row.division} ${row.coach}`.toLowerCase().includes(needle);
      const matchStatus = status === "Tous les statuts" || row.status === status;
      return matchSearch && matchStatus;
    });
  }, [rows, search, status]);

  const openCreate = () => {
    setEditing(null);
    setDrawerOpen(true);
  };

  const openEdit = (row: TeamRow) => {
    setEditing(row);
    setDrawerOpen(true);
  };

  const save = (row: TeamRow) => {
    if (editing) {
      setRows((current) => current.map((item) => (item.id === row.id ? row : item)));
      toast("L'équipe a été mise à jour.");
    } else {
      setRows((current) => [row, ...current]);
      toast("L'équipe a été créée.");
    }
    setDrawerOpen(false);
    setEditing(null);
  };

  return (
    <>
      <PageHeader
        id="tour-teams-header"
        eyebrow="Référentiels"
        title="Équipes"
        description="Gérez les équipes et leurs identités."
        action={{ label: "Créer une équipe", icon: Plus, onClick: openCreate }}
      />

      <Filters
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Rechercher une équipe, un coach…"
        selects={[
          {
            label: "Statut",
            value: status,
            options: ["Tous les statuts", "Active", "Externe", "Archivée"],
            onChange: setStatus,
          },
        ]}
        onReset={() => {
          setSearch("");
          setStatus("Tous les statuts");
        }}
      />

      <DataTable
        id="tour-teams-table"
        rows={filtered}
        rowKey={(row) => row.id}
        minWidth={840}
        grid="1.5fr 1fr 1.2fr .9fr .8fr 36px"
        columns={[
          {
            key: "name",
            label: "Équipe",
            render: (row) => (
              <span className="flex items-center gap-2.5">
                <span className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-green text-[9px] font-extrabold text-brand-foreground">
                  {row.name.split(" ").slice(0, 2).map((part) => part[0]).join("")}
                </span>
                <strong className="truncate">{row.name}</strong>
              </span>
            ),
          },
          {
            key: "division",
            label: "Division",
            render: (row) => <span className="rounded-full bg-mint px-2.5 py-1 text-[10.5px] font-bold text-mint-foreground">{row.division}</span>,
          },
          { key: "coach", label: "Coach", render: (row) => row.coach },
          { key: "players", label: "Joueurs", render: (row) => row.players },
          {
            key: "status",
            label: "Statut",
            render: (row) => (
              <Status tone={row.status === "Active" ? "success" : row.status === "Externe" ? "info" : "neutral"}>
                {row.status}
              </Status>
            ),
          },
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
        title={editing ? "Modifier l'équipe" : "Créer une équipe"}
        subtitle="Identité et encadrement"
        footer={
          <DrawerFooter
            onCancel={() => setDrawerOpen(false)}
            submitLabel={editing ? "Enregistrer" : "Créer l'équipe"}
            form="team-form"
          />
        }
      >
        {drawerOpen && <Form key={editing?.id ?? "new"} row={editing} onSave={save} />}
      </Drawer>
    </>
  );
}
