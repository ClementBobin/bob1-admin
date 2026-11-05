"use client";

import { useEffect, useMemo, useState } from "react";
import { Minus, MoreHorizontal, Plus } from "lucide-react";
import { matchToRow } from "@/lib/adapters";
import { api, errorMessage } from "@/lib/api";
import { useApiData } from "@/hooks/use-api-data";
import { cn, formatDateLabel, localDateParts } from "@/lib/utils";
import { FILTER_ALL, MATCH_STATUS_OPTIONS, statusTone } from "@/lib/constants";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { OptionSelect } from "@/components/shared/option-select";
import { Status } from "@/components/shared/status";
import { DataTable } from "@/components/shared/data-table";
import { Filters } from "@/components/shared/filters";
import { PageHeader } from "@/components/layout/page-header";
import { FormSheet, FormSheetFooter } from "@/components/shared/form-sheet";
import { Progress } from "@/components/ui/progress";
import { ErrorBanner } from "@/components/shared/error-banner";
import type { DivisionDto, MatchDto, MatchRow, VenueDto } from "@/types";

function FillMeter({ value, total }: { value: number; total: number }) {
  const ratio = total === 0 ? 0 : Math.min(100, Math.round((value / total) * 100));
  const color =
    value === 0
      ? "[&>[data-slot=progress-indicator]]:bg-danger"
      : value === total
        ? "[&>[data-slot=progress-indicator]]:bg-green"
        : "[&>[data-slot=progress-indicator]]:bg-brand";
  return (
    <span className="flex items-center gap-2">
      <Progress value={ratio} className={cn("h-1.5 w-11 bg-muted", color)} />
      <b className="text-[11px] font-semibold text-muted-foreground">
        {value}/{total}
      </b>
    </span>
  );
}

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

const slotLabels: Array<{ key: string; label: string; kind: "Staff" | "Volunteer" }> = [
  { key: "arbitres", label: "Arbitres", kind: "Staff" },
  { key: "chrono", label: "Chrono", kind: "Staff" },
  { key: "mar", label: "MAR", kind: "Staff" },
  { key: "buvette", label: "Buvette", kind: "Volunteer" },
];

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
  divisionOptions,
  venueOptions,
  onSave,
}: {
  match: MatchRowEx | null;
  divisionOptions: string[];
  venueOptions: string[];
  onSave: (payload: MatchPayload) => void;
}) {
  const initial = localDateParts(match?.startsAtUtc);
  const [division, setDivision] = useState(match?.division ?? divisionOptions[0] ?? "U13 M");
  const [homeTeam, setHomeTeam] = useState(match?.home ?? "BOB1");
  const [awayTeam, setAwayTeam] = useState(match?.away ?? "Castelnau Basket");
  const [date, setDate] = useState(initial.date);
  const [time, setTime] = useState(initial.time);
  const [venue, setVenue] = useState(match?.venue ?? venueOptions[0] ?? "Coubertin");
  const [slots, setSlots] = useState<Record<string, number>>({
    arbitres: match?.officials[1] || 4,
    chrono: match?.chrono[1] || 1,
    mar: match?.mar[1] || 1,
    buvette: match?.buvette[1] || 2,
  });

  // Divisions/venues load asynchronously; keep the selects on a valid option.
  useEffect(() => {
    if (divisionOptions.length > 0 && !divisionOptions.includes(division)) setDivision(divisionOptions[0]);
  }, [divisionOptions, division]);

  useEffect(() => {
    if (venueOptions.length > 0 && !venueOptions.includes(venue)) setVenue(venueOptions[0]);
  }, [venueOptions, venue]);

  const updateSlot = (key: string, amount: number) => {
    setSlots((current) => ({ ...current, [key]: Math.max(0, Math.min(12, current[key] + amount)) }));
  };

  return (
    <form
      id="match-form"
      onSubmit={(event) => {
        event.preventDefault();
        const isHome = homeTeam === "BOB1" || homeTeam === "BOB1 U13 M" || homeTeam.startsWith("BOB1");
        const opponentName = isHome ? awayTeam : homeTeam;
        onSave({
          divisionName: division,
          opponent: opponentName,
          isHome,
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
            chrono: [0, slots.chrono],
            mar: [0, slots.mar],
            carpool: `${slots.covoiturage} places`,
            status: match?.status ?? "Brouillon",
            opponent: opponentName,
            isHome,
            startsAtUtc: new Date(`${date}T${time}:00`).toISOString(),
          },
        });
      }}
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <Field className="col-span-full">
          <FieldLabel htmlFor="matches-field-1" className="text-[11px] font-bold text-muted-foreground">
            Division
          </FieldLabel>
          <OptionSelect id="matches-field-1" value={division} onValueChange={setDivision} options={divisionOptions} />
        </Field>

        <>
          <Field>
            <FieldLabel htmlFor="matches-field-2" className="text-[11px] font-bold text-muted-foreground">
              Équipe à domicile
            </FieldLabel>
            <OptionSelect
              id="matches-field-2"
              value={homeTeam}
              onValueChange={setHomeTeam}
              options={teamOptions}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="matches-field-3" className="text-[11px] font-bold text-muted-foreground">
              Équipe à l'extérieur
            </FieldLabel>
            <OptionSelect
              id="matches-field-3"
              value={awayTeam}
              onValueChange={setAwayTeam}
              options={teamOptions}
            />
          </Field>
        </>

        <Field>
          <FieldLabel htmlFor="matches-field-6" className="text-[11px] font-bold text-muted-foreground">
            Date
          </FieldLabel>
          <Input
            id="matches-field-6"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="matches-field-7" className="text-[11px] font-bold text-muted-foreground">
            Heure
          </FieldLabel>
          <Input
            id="matches-field-7"
            type="time"
            value={time}
            onChange={(event) => setTime(event.target.value)}
            required
          />
        </Field>
        <Field className="col-span-full">
          <FieldLabel htmlFor="matches-field-8" className="text-[11px] font-bold text-muted-foreground">
            Lieu
          </FieldLabel>
          <OptionSelect id="matches-field-8" value={venue} onValueChange={setVenue} options={venueOptions} />
        </Field>
      </div>

      <span className="mt-2 text-[10px] font-extrabold uppercase tracking-[0.08em] text-soft">Postes nécessaires</span>
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
        Les postes saisis sont créés en même temps que le match. Vous pourrez les ajuster depuis la fiche du match.
      </p>
    </form>
  );
}

export default function MatchesPage() {
  const [rows, setRows] = useState<MatchRowEx[]>([]);
  const [search, setSearch] = useState("");
  const [division, setDivision] = useState(FILTER_ALL.divisions);
  const [status, setStatus] = useState(FILTER_ALL.statuses);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<MatchRowEx | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: apiMatches, loading, error, reload } = useApiData<MatchDto[]>(() => api.matches.list(), []);
  const { data: apiDivisions } = useApiData<DivisionDto[]>(() => api.divisions.list(), []);
  const { data: apiVenues } = useApiData<VenueDto[]>(() => api.venues.list(), []);

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

  const divisionOptions: NamedOption[] = (apiDivisions ?? []).map((item) => ({ id: item.id, name: item.name }));

  const venueOptions: NamedOption[] = (apiVenues ?? []).map((item) => ({ id: item.id, name: item.name }));

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

  const statusOptions = [FILTER_ALL.statuses, ...MATCH_STATUS_OPTIONS];

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchSearch = `${row.home} ${row.away} ${row.division} ${row.venue} ${row.date}`
        .toLowerCase()
        .includes(needle);
      const matchDivision = division === FILTER_ALL.divisions || row.division === division;
      const matchStatus = status === FILTER_ALL.statuses || row.status === status;
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
    const divisionId = divisionOptions.find((item) => item.name === payload.divisionName)?.id;
    const venueId = venueOptions.find((item) => item.name === payload.venueName)?.id;
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
        for (const spec of slotLabels) {
          const capacity = payload.slots[spec.key] ?? 0;
          if (capacity <= 0) continue;
          try {
            await api.slots.create(created.id, { kind: spec.kind, role: spec.label, capacity });
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
      setDrawerOpen(false);
      setEditing(null);
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
            options: [FILTER_ALL.divisions, ...divisionNames],
            onChange: setDivision,
          },
          { label: "Statut", value: status, options: statusOptions, onChange: setStatus },
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
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground"
                onClick={() => openEdit(row)}
                aria-label={`Modifier le match ${row.home} — ${row.away}`}
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
        title={editing ? "Modifier le match" : "Créer un match"}
        subtitle={editing ? `${editing.home} — ${editing.away}` : "Nouvelle rencontre"}
        footer={
          <FormSheetFooter
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
            divisionOptions={divisionNames}
            venueOptions={venueNames}
            onSave={save}
          />
        )}
      </FormSheet>
    </>
  );
}
