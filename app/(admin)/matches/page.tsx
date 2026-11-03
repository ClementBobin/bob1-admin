"use client";

import { useEffect, useMemo, useState } from "react";
import { Minus, MoreHorizontal, Plus } from "lucide-react";
import { divisions, matches, type MatchRow } from "@/lib/data";
import { matchToRow } from "@/lib/adapters";
import {
  api,
  errorMessage,
  USE_MOCK,
  type DivisionDto,
  type MatchDto,
  type VenueDto,
} from "@/lib/api";
import { useApiData } from "@/lib/use-api-data";
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

type MatchRowEx = MatchRow & {
  opponent?: string;
  isHome?: boolean;
  startsAtUtc?: string;
};

type NamedOption = { id: string; name: string };

const teamOptions = [
  "BOB1",
  "Castelnau Basket",
  "Lattes Basket",
  "Mauguio BC",
  "Nîmes Gard BC",
  "Lunel Basket",
  "Sète Basket",
];

const mockVenueOptions = [
  "Coubertin",
  "Palais des sports",
  "Gymnase de Lattes",
  "Halle Mauguio",
  "Complexe de Lunel",
  "Halle des Sports de Sète",
  "Mauguio",
  "Lunel",
  "Castelnau",
];

const mockDivisionOptions: NamedOption[] = divisions
  .filter((item) => item.status === "Active")
  .map((item) => ({
    id: item.id,
    name: item.name.replace("Masculins", "M").replace("Féminines", "F"),
  }));

const slotLabels: Array<{ key: string; label: string; kind: "Staff" | "Volunteer" }> = [
  { key: "arbitres", label: "Arbitres", kind: "Staff" },
  { key: "chrono", label: "Chrono", kind: "Staff" },
  { key: "mar", label: "MAR", kind: "Staff" },
  { key: "buvette", label: "Buvette", kind: "Volunteer" },
  { key: "covoiturage", label: "Covoiturage", kind: "Volunteer" },
];

const statusTone = (status: string) => {
  if (status === "Confirmé" || status === "J-4") return "success" as const;
  if (status === "Brouillon" || status === "Annulé") return "neutral" as const;
  return "warning" as const;
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function localDateParts(iso?: string): { date: string; time: string } {
  const date = iso ? new Date(iso) : null;
  if (!date || Number.isNaN(date.getTime())) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return {
      date: `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`,
      time: "14:30",
    };
  }
  return {
    date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  };
}

function formatDateLabel(value: string, time: string) {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return `${value} · ${time}`;
  const label = date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }).replace(".", "");
  return `${label} · ${time}`;
}

type MatchPayload = {
  divisionName: string;
  opponent: string;
  isHome: boolean;
  venueName: string;
  date: string;
  time: string;
  slots: Record<string, number>;
  row: MatchRowEx;
};

function MatchForm({
  match,
  live,
  divisionOptions,
  venueOptions,
  onSave,
}: {
  match: MatchRowEx | null;
  live: boolean;
  divisionOptions: string[];
  venueOptions: string[];
  onSave: (payload: MatchPayload) => void;
}) {
  const initial = localDateParts(match?.startsAtUtc);
  const [division, setDivision] = useState(match?.division ?? divisionOptions[0] ?? "U13 M");
  const [home, setHome] = useState(match?.home ?? "BOB1");
  const [away, setAway] = useState(match?.away ?? "Castelnau Basket");
  const [opponent, setOpponent] = useState(
    match?.opponent ?? (match ? (match.home === "BOB1" ? match.away : match.home) : "Castelnau Basket")
  );
  const [isHome, setIsHome] = useState(match?.isHome ?? true);
  const [date, setDate] = useState(initial.date);
  const [time, setTime] = useState(initial.time);
  const [venue, setVenue] = useState(match?.venue ?? venueOptions[0] ?? "Coubertin");
  const [slots, setSlots] = useState<Record<string, number>>({
    arbitres: match?.officials[1] || 4,
    chrono: 1,
    mar: 1,
    buvette: match?.buvette[1] || 2,
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
        const homeTeam = live ? (isHome ? "BOB1" : opponent.trim()) : home;
        const awayTeam = live ? (isHome ? opponent.trim() : "BOB1") : away;
        onSave({
          divisionName: division,
          opponent: live ? opponent.trim() : homeTeam === "BOB1" ? awayTeam : homeTeam,
          isHome: live ? isHome : homeTeam === "BOB1",
          venueName: venue,
          date,
          time,
          slots,
          row: {
            id: match?.id ?? `m${Date.now()}`,
            date: formatDateLabel(date, time),
            division,
            home: homeTeam,
            away: awayTeam,
            venue,
            officials: [match?.officials[0] ?? 0, slots.arbitres],
            buvette: [match?.buvette[0] ?? 0, slots.buvette],
            carpool: `${slots.covoiturage} places`,
            status: match?.status ?? "Brouillon",
            opponent: live ? opponent.trim() : homeTeam === "BOB1" ? awayTeam : homeTeam,
            isHome: live ? isHome : homeTeam === "BOB1",
            startsAtUtc: new Date(`${date}T${time}:00`).toISOString(),
          },
        });
      }}
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <FormField label="Division" wide>
          <SelectInput
            value={division}
            onChange={(event) => setDivision(event.target.value)}
            options={divisionOptions}
          />
        </FormField>

        {live ? (
          <>
            <FormField label="Adversaire">
              <TextInput
                value={opponent}
                onChange={(event) => setOpponent(event.target.value)}
                placeholder="Castelnau Basket"
                required
              />
            </FormField>
            <FormField label="Lieu de la rencontre">
              <SelectInput value={isHome ? "Domicile" : "Extérieur"} onChange={(event) => setIsHome(event.target.value === "Domicile")} options={["Domicile", "Extérieur"]} />
            </FormField>
          </>
        ) : (
          <>
            <FormField label="Équipe à domicile">
              <SelectInput value={home} onChange={(event) => setHome(event.target.value)} options={teamOptions} />
            </FormField>
            <FormField label="Équipe à l'extérieur">
              <SelectInput value={away} onChange={(event) => setAway(event.target.value)} options={teamOptions} />
            </FormField>
          </>
        )}

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
        {slotLabels.map(({ key, label }) => (
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
        {live
          ? "Les postes saisis sont créés en même temps que le match. Vous pourrez les ajuster depuis la fiche du match."
          : "Les bénévoles recevront une notification dès la publication du match. Vous pourrez ajuster les postes depuis la fiche du match."}
      </p>
    </form>
  );
}

export default function MatchesPage() {
  const [rows, setRows] = useState<MatchRowEx[]>(
    USE_MOCK
      ? matches.map((item) => ({
          ...item,
          opponent: item.home === "BOB1" ? item.away : item.home,
          isHome: item.home === "BOB1",
        }))
      : []
  );
  const [search, setSearch] = useState("");
  const [division, setDivision] = useState("Toutes les divisions");
  const [status, setStatus] = useState("Tous les statuts");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<MatchRowEx | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const { data: apiMatches, loading, error, reload } = useApiData<MatchDto[]>(
    () => api.matches.list(),
    []
  );
  const { data: apiDivisions } = useApiData<DivisionDto[]>(() => api.divisions.list(), []);
  const { data: apiVenues } = useApiData<VenueDto[]>(() => api.venues.list(), []);

  useEffect(() => {
    if (USE_MOCK) return;
    setRows(
      apiMatches.map((match) => ({
        ...matchToRow(match),
        opponent: match.opponent,
        isHome: match.isHome,
        startsAtUtc: match.startsAtUtc,
      }))
    );
  }, [apiMatches]);

  const divisionOptions: NamedOption[] = USE_MOCK
    ? mockDivisionOptions
    : apiDivisions.map((item) => ({ id: item.id, name: item.name }));

  const venueOptions: NamedOption[] = USE_MOCK
    ? mockVenueOptions.map((name) => ({ id: name, name }))
    : apiVenues.map((item) => ({ id: item.id, name: item.name }));

  const divisionNames = useMemo(() => {
    const names = divisionOptions.map((item) => item.name);
    if (editing && !names.includes(editing.division)) return [editing.division, ...names];
    return names;
  }, [divisionOptions, editing]);

  const venueNames = useMemo(() => {
    const names = venueOptions.map((item) => item.name);
    if (editing && !names.includes(editing.venue)) return [editing.venue, ...names];
    return names;
  }, [venueOptions, editing]);

  const statusOptions = USE_MOCK
    ? ["Tous les statuts", "J-15", "J-4", "Confirmé", "Brouillon"]
    : ["Tous les statuts", "J-15", "Confirmé", "Annulé"];

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

  const openEdit = (row: MatchRowEx) => {
    setEditing(row);
    setDrawerOpen(true);
  };

  const save = async (payload: MatchPayload) => {
    if (USE_MOCK) {
      if (editing) {
        setRows((current) => current.map((item) => (item.id === payload.row.id ? payload.row : item)));
        toast("Le match a été mis à jour.");
      } else {
        setRows((current) => [payload.row, ...current]);
        toast("Le match a été créé et publié au calendrier.");
      }
      setDrawerOpen(false);
      setEditing(null);
      return;
    }

    const divisionId = divisionOptions.find((item) => item.name === payload.divisionName)?.id;
    const venueId = venueOptions.find((item) => item.name === payload.venueName)?.id;
    if (!divisionId || !venueId) {
      toast("Sélectionnez une division et un lieu existants.", "danger");
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
        toast("Le match a été mis à jour.");
      } else {
        const created = await api.matches.create(input);
        const failures: string[] = [];
        for (const spec of slotLabels) {
          const capacity = payload.slots[spec.key] ?? 0;
          if (capacity <= 0) continue;
          try {
            await api.slots.create(created.id, { kind: spec.kind, role: spec.label, capacity });
          } catch {
            failures.push(spec.label);
          }
        }
        toast(
          failures.length
            ? `Le match a été créé, mais les postes suivants n'ont pas pu être ajoutés : ${failures.join(", ")}.`
            : "Le match a été créé et publié au calendrier.",
          failures.length ? "danger" : "success"
        );
      }
      await reload();
      setDrawerOpen(false);
      setEditing(null);
    } catch (cause) {
      toast(errorMessage(cause), "danger");
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
            options: ["Toutes les divisions", ...divisionNames],
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

      {!USE_MOCK && error && (
        <div className="mb-4 rounded-xl bg-danger-soft px-4 py-3 text-[12px] font-medium text-danger">{error}</div>
      )}

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
            render: (row) =>
              USE_MOCK ? <FillMeter value={row.officials[0]} total={row.officials[1]} /> : <span className="text-soft">—</span>,
          },
          {
            key: "buvette",
            label: "Buvette",
            render: (row) =>
              USE_MOCK ? <FillMeter value={row.buvette[0]} total={row.buvette[1]} /> : <span className="text-soft">—</span>,
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
            submitLabel={saving ? "Enregistrement…" : editing ? "Enregistrer les modifications" : "Créer le match"}
            form="match-form"
          />
        }
      >
        {drawerOpen && (
          <MatchForm
            key={editing?.id ?? "new"}
            match={editing}
            live={!USE_MOCK}
            divisionOptions={divisionNames}
            venueOptions={venueNames}
            onSave={save}
          />
        )}
      </Drawer>
    </>
  );
}
