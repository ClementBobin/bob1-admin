"use client";

import { useMemo, useState } from "react";
import { Minus, MoreHorizontal, Plus } from "lucide-react";
import { divisions, matches, type MatchRow } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/toast";
import {
  Button,
  DataTable,
  Drawer,
  DrawerFooter,
  FillMeter,
  Filters,
  FormField,
  PageHeader,
  SelectInput,
  Status,
  TextInput,
} from "@/components/ui";

const teamOptions = [
  "BOB1",
  "Castelnau Basket",
  "Lattes Basket",
  "Mauguio BC",
  "Nîmes Gard BC",
  "Lunel Basket",
  "Sète Basket",
];

const venueOptions = [
  "Coubertin",
  "Palais des sports",
  "Gymnase de Lattes",
  "Halle Mauguio",
  "Complexe de Lunel",
  "Halle des Sports de Sète",
];

const statusOptions = ["Tous les statuts", "J-15", "J-4", "Confirmé", "Brouillon"];

const slotLabels: Array<[string, string]> = [
  ["arbitres", "Arbitres"],
  ["chrono", "Chrono"],
  ["mar", "MAR"],
  ["buvette", "Buvette"],
  ["covoiturage", "Covoiturage"],
];

const statusTone = (status: string) => {
  if (status === "Confirmé" || status === "J-4") return "success" as const;
  if (status === "Brouillon") return "neutral" as const;
  return "warning" as const;
};

function formatDate(value: string, time: string) {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return `24 mai · ${time}`;
  const label = date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }).replace(".", "");
  return `${label} · ${time}`;
}

function MatchForm({
  match,
  onSave,
}: {
  match: MatchRow | null;
  onSave: (row: MatchRow) => void;
}) {
  const [division, setDivision] = useState(match?.division ?? "U13 M");
  const [home, setHome] = useState(match?.home ?? "BOB1");
  const [away, setAway] = useState(match?.away ?? "Castelnau Basket");
  const [date, setDate] = useState("2025-05-24");
  const [time, setTime] = useState("14:30");
  const [venue, setVenue] = useState(match?.venue ?? "Coubertin");
  const [slots, setSlots] = useState<Record<string, number>>({
    arbitres: match?.officials[1] ?? 4,
    chrono: 1,
    mar: 1,
    buvette: match?.buvette[1] ?? 2,
    covoiturage: 4,
  });

  const updateSlot = (key: string, amount: number) => {
    setSlots((current) => ({ ...current, [key]: Math.max(0, Math.min(12, current[key] + amount)) }));
  };

  return (
    <form
      id="match-form"
      onSubmit={(event) => {
        event.preventDefault();
        const row: MatchRow = {
          id: match?.id ?? `m${Date.now()}`,
          date: formatDate(date, time),
          division,
          home,
          away,
          venue,
          officials: [match?.officials[0] ?? 0, slots.arbitres],
          buvette: [match?.buvette[0] ?? 0, slots.buvette],
          carpool: `${slots.covoiturage} places`,
          status: match?.status ?? "Brouillon",
        };
        onSave(row);
      }}
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <FormField label="Division" wide>
          <SelectInput
            value={division}
            onChange={(event) => setDivision(event.target.value)}
            options={divisions.filter((item) => item.status === "Active").map((item) => item.name)}
          />
        </FormField>
        <FormField label="Équipe à domicile">
          <SelectInput value={home} onChange={(event) => setHome(event.target.value)} options={teamOptions} />
        </FormField>
        <FormField label="Équipe à l'extérieur">
          <SelectInput value={away} onChange={(event) => setAway(event.target.value)} options={teamOptions} />
        </FormField>
        <FormField label="Date">
          <TextInput type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
        </FormField>
        <FormField label="Heure">
          <TextInput type="time" value={time} onChange={(event) => setTime(event.target.value)} required />
        </FormField>
        <FormField label="Lieu" wide>
          <SelectInput value={venue} onChange={(event) => setVenue(event.target.value)} options={venueOptions} />
        </FormField>
      </div>

      <span className="mt-2 text-[10px] font-extrabold uppercase tracking-[0.08em] text-soft">
        Postes nécessaires
      </span>
      <div className="overflow-hidden rounded-[13px] border border-line">
        {slotLabels.map(([key, label]) => (
          <div
            key={key}
            className="flex min-h-[50px] items-center justify-between gap-3 border-b border-line px-3.5 last:border-b-0"
          >
            <span className="text-[12.5px] font-medium">{label}</span>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => updateSlot(key, -1)}
                aria-label={`Retirer un poste ${label}`}
                className="grid size-7 place-items-center rounded-lg border border-line text-soft transition hover:bg-muted disabled:opacity-40"
                disabled={slots[key] === 0}
              >
                <Minus size={13} />
              </button>
              <b className="w-5 text-center text-[12px] font-bold">{slots[key]}</b>
              <button
                type="button"
                onClick={() => updateSlot(key, 1)}
                aria-label={`Ajouter un poste ${label}`}
                className="grid size-7 place-items-center rounded-lg border border-line text-soft transition hover:bg-muted"
              >
                <Plus size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="rounded-xl bg-muted px-3.5 py-3 text-[11px] leading-relaxed text-soft">
        Les bénévoles recevront une notification dès la publication du match. Vous pourrez ajuster les postes
        depuis la fiche du match.
      </p>
    </form>
  );
}

export default function MatchesPage() {
  const [rows, setRows] = useState<MatchRow[]>(matches);
  const [search, setSearch] = useState("");
  const [division, setDivision] = useState("Toutes les divisions");
  const [status, setStatus] = useState("Tous les statuts");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<MatchRow | null>(null);
  const { toast } = useToast();

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchSearch = `${row.home} ${row.away} ${row.division} ${row.venue} ${row.date}`
        .toLowerCase()
        .includes(needle);
      const matchDivision = division === "Toutes les divisions" || row.division === division;
      const matchStatus = status === "Tous les statuts" || row.status === status;
      return matchSearch && matchDivision && matchStatus;
    });
  }, [rows, search, division, status]);

  const openCreate = () => {
    setEditing(null);
    setDrawerOpen(true);
  };

  const openEdit = (row: MatchRow) => {
    setEditing(row);
    setDrawerOpen(true);
  };

  const save = (row: MatchRow) => {
    if (editing) {
      setRows((current) => current.map((item) => (item.id === row.id ? row : item)));
      toast("Le match a été mis à jour.");
    } else {
      setRows((current) => [row, ...current]);
      toast("Le match a été créé et publié au calendrier.");
    }
    setDrawerOpen(false);
    setEditing(null);
  };

  return (
    <>
      <PageHeader
        id="tour-matches-header"
        eyebrow="Organisation"
        title="Matchs"
        description="Planifiez les rencontres et suivez les besoins du club."
        action={{ label: "Créer un match", icon: Plus, onClick: openCreate }}
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
            options: ["Toutes les divisions", ...divisions.map((item) => item.name.replace("Masculins", "M").replace("Féminines", "F"))],
            onChange: setDivision,
          },
          { label: "Statut", value: status, options: statusOptions, onChange: setStatus },
        ]}
        onReset={() => {
          setSearch("");
          setDivision("Toutes les divisions");
          setStatus("Tous les statuts");
        }}
      />

      <DataTable
        id="tour-matches-table"
        rows={filtered}
        rowKey={(row) => row.id}
        minWidth={1060}
        grid="1.1fr .65fr 1.4fr 1.1fr .9fr .9fr 1fr .8fr 36px"
        emptyMessage="Modifiez vos filtres ou créez un nouveau match pour le voir apparaître ici."
        columns={[
          {
            key: "date",
            label: "Date",
            render: (row) => <strong className="text-[12.5px] font-bold">{row.date}</strong>,
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
                {row.home} <span className="font-medium text-soft">—</span> {row.away}
              </strong>
            ),
          },
          { key: "venue", label: "Lieu", render: (row) => <span className="truncate">{row.venue}</span> },
          {
            key: "officials",
            label: "Officiels",
            render: (row) => <FillMeter value={row.officials[0]} total={row.officials[1]} />,
          },
          {
            key: "buvette",
            label: "Buvette",
            render: (row) => <FillMeter value={row.buvette[0]} total={row.buvette[1]} />,
          },
          {
            key: "carpool",
            label: "Covoiturage",
            render: (row) => (
              <span className={cn("text-[11.5px]", row.carpool === "Complet" ? "font-bold text-green" : "text-soft")}>
                {row.carpool}
              </span>
            ),
          },
          {
            key: "status",
            label: "Statut",
            render: (row) => <Status tone={statusTone(row.status)}>{row.status}</Status>,
          },
          {
            key: "actions",
            label: "",
            render: (row) => (
              <button
                onClick={() => openEdit(row)}
                aria-label={`Modifier le match ${row.home} — ${row.away}`}
                className="grid size-8 place-items-center rounded-lg text-soft transition hover:bg-muted hover:text-ink"
              >
                <MoreHorizontal size={16} />
              </button>
            ),
          },
        ]}
      />

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editing ? "Modifier le match" : "Créer un match"}
        subtitle={editing ? `${editing.home} — ${editing.away}` : "Nouvelle rencontre"}
        footer={
          <DrawerFooter
            onCancel={() => setDrawerOpen(false)}
            submitLabel={editing ? "Enregistrer les modifications" : "Créer le match"}
            form="match-form"
          />
        }
      >
        {drawerOpen && (
          <MatchForm
            key={editing?.id ?? "new"}
            match={editing}
            onSave={save}
          />
        )}
      </Drawer>
    </>
  );
}
