"use client";

import { useMemo, useState } from "react";
import { MoreHorizontal, Plus } from "lucide-react";
import { penalties, people, type PenaltyRow } from "@/lib/data";
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
  Toggle,
} from "@/components/ui";
import { cn } from "@/lib/utils";

const reasons = ["Absence non signalée", "Désistement tardif", "Retard important", "Oubli de matériel"];
const pointOptions = ["− 5 points", "− 10 points", "− 15 points"];

function PenaltyForm({ row, onSave }: { row: PenaltyRow | null; onSave: (row: PenaltyRow) => void }) {
  const [person, setPerson] = useState(row?.person ?? people[0].name);
  const [match, setMatch] = useState(row?.match ?? "U17 vs Lattes");
  const [reason, setReason] = useState(row?.reason ?? reasons[0]);
  const [points, setPoints] = useState(`− ${Math.abs(row?.points ?? 10)} points`);
  const [exclusion, setExclusion] = useState(row?.exclusion ?? false);
  const [status, setStatus] = useState(row?.status ?? "Non lue");

  return (
    <form
      id="penalty-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSave({
          id: row?.id ?? `pe${Date.now()}`,
          person,
          match,
          reason,
          points: -Number(points.replace(/\D/g, "")),
          exclusion,
          created: row?.created ?? "Aujourd'hui",
          status,
        });
      }}
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-1 gap-3.5">
        <FormField label="Personne">
          <SelectInput value={person} onChange={(event) => setPerson(event.target.value)} options={people.map((item) => item.name)} />
        </FormField>
        <FormField label="Match concerné">
          <TextInput
            value={match}
            onChange={(event) => setMatch(event.target.value)}
            placeholder="U17 vs Lattes · 24 mai"
          />
        </FormField>
        <FormField label="Motif">
          <SelectInput value={reason} onChange={(event) => setReason(event.target.value)} options={reasons} />
        </FormField>
        <FormField label="Points retirés">
          <SelectInput value={points} onChange={(event) => setPoints(event.target.value)} options={pointOptions} />
        </FormField>
        <FormField label="Statut">
          <SelectInput value={status} onChange={(event) => setStatus(event.target.value)} options={["Non lue", "Reconnue"]} />
        </FormField>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-[13px] border border-line p-3.5">
        <span className="flex flex-col">
          <strong className="text-[12px]">Exclure du match</strong>
          <small className="mt-0.5 text-[10.5px] text-soft">La personne sera retirée de son affectation.</small>
        </span>
        <Toggle checked={exclusion} onChange={setExclusion} label="Exclure du match" />
      </div>

      <div
        className={cn(
          "flex items-start gap-2.5 rounded-xl px-3.5 py-3 text-[11px] leading-relaxed",
          "bg-danger-soft text-danger"
        )}
      >
        <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-danger/10 font-extrabold">!</span>
        <span>
          La personne recevra le motif, les points perdus et pourra contacter l&apos;administration. L&apos;action
          est conservée dans l&apos;historique.
        </span>
      </div>
    </form>
  );
}

export default function PenaltiesPage() {
  const [rows, setRows] = useState<PenaltyRow[]>(penalties);
  const [search, setSearch] = useState("");
  const [reason, setReason] = useState("Tous les motifs");
  const [status, setStatus] = useState("Tous les statuts");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<PenaltyRow | null>(null);
  const { toast } = useToast();

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchSearch = `${row.person} ${row.match} ${row.reason}`.toLowerCase().includes(needle);
      const matchReason = reason === "Tous les motifs" || row.reason === reason;
      const matchStatus = status === "Tous les statuts" || row.status === status;
      return matchSearch && matchReason && matchStatus;
    });
  }, [rows, search, reason, status]);

  const openCreate = () => {
    setEditing(null);
    setDrawerOpen(true);
  };

  const openEdit = (row: PenaltyRow) => {
    setEditing(row);
    setDrawerOpen(true);
  };

  const save = (row: PenaltyRow) => {
    if (editing) {
      setRows((current) => current.map((item) => (item.id === row.id ? row : item)));
      toast("La pénalité a été mise à jour.");
    } else {
      setRows((current) => [row, ...current]);
      toast("La pénalité a été enregistrée.");
    }
    setDrawerOpen(false);
    setEditing(null);
  };

  return (
    <>
      <PageHeader
        id="tour-penalties-header"
        eyebrow="Modération"
        title="Pénalités"
        description="Suivez les sanctions et leur prise de connaissance."
        action={{ label: "Créer une pénalité", icon: Plus, onClick: openCreate }}
      />

      <Filters
        id="tour-penalties-filters"
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Rechercher une personne, un motif…"
        selects={[
          { label: "Motif", value: reason, options: ["Tous les motifs", ...reasons], onChange: setReason },
          { label: "Statut", value: status, options: ["Tous les statuts", "Non lue", "Reconnue"], onChange: setStatus },
        ]}
        onReset={() => {
          setSearch("");
          setReason("Tous les motifs");
          setStatus("Tous les statuts");
        }}
      />

      <DataTable
        id="tour-penalties-table"
        rows={filtered}
        rowKey={(row) => row.id}
        minWidth={1000}
        grid="1.05fr 1.2fr 1.45fr .65fr .75fr .8fr .85fr 36px"
        columns={[
          { key: "person", label: "Personne", render: (row) => <strong className="truncate">{row.person}</strong> },
          { key: "match", label: "Match", render: (row) => <span className="truncate text-soft">{row.match}</span> },
          { key: "reason", label: "Motif", render: (row) => row.reason },
          { key: "points", label: "Points", render: (row) => <span className="font-bold text-danger">{row.points} pts</span> },
          {
            key: "exclusion",
            label: "Exclusion",
            render: (row) => <Status tone={row.exclusion ? "danger" : "neutral"}>{row.exclusion ? "Oui" : "Non"}</Status>,
          },
          { key: "created", label: "Créée le", render: (row) => <span className="text-soft">{row.created}</span> },
          {
            key: "status",
            label: "Statut",
            render: (row) => <Status tone={row.status === "Non lue" ? "warning" : "success"}>{row.status}</Status>,
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

      <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] text-soft">
        <span className="size-1.5 rounded-full bg-danger" />
        {rows.filter((row) => row.status === "Non lue").length} pénalités n&apos;ont pas encore été consultées.
      </div>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editing ? "Modifier la pénalité" : "Créer une pénalité"}
        subtitle={editing ? editing.person : "Nouvelle sanction"}
        footer={
          <DrawerFooter
            onCancel={() => setDrawerOpen(false)}
            submitLabel={editing ? "Enregistrer" : "Créer la pénalité"}
            form="penalty-form"
          />
        }
      >
        {drawerOpen && <PenaltyForm key={editing?.id ?? "new"} row={editing} onSave={save} />}
      </Drawer>
    </>
  );
}
