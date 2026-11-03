"use client";

import { useEffect, useMemo, useState } from "react";
import { Filter, Plus, Undo2, Download } from "lucide-react";
import { historyEntries, people, type HistoryEntry } from "@/lib/data";
import { historyEntryToRow, penaltyToRow, ruleCategoryLabel } from "@/lib/adapters";
import {
  api,
  errorMessage,
  USE_MOCK,
  type EntryDto,
  type AdminFamilyDto,
  type PenaltyDto,
  type RankingRuleDto,
} from "@/lib/api";
import { useApiData } from "@/lib/use-api-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { OptionSelect } from "@/components/option-select";
import { InitialsAvatar } from "@/components/initials-avatar";
import { Status } from "@/components/status";
import { DataTable } from "@/components/data-table";
import { Filters } from "@/components/filters";
import { PageHeader } from "@/components/page-header";
import { FormSheet, FormSheetFooter } from "@/components/form-sheet";

const CATEGORIES = ["presence", "volunteer", "staff", "carpool", "penalty"];
const REASONS = [
  "Présence confirmée",
  "Bénévolat (buvette...)",
  "Poste de staff (MAR, arbitre...)",
  "Covoiturage proposé",
  "Absence non excusée",
  "Désistement tardif",
  "Retard important",
  "Oubli de matériel",
  "Autre",
];

type HistoryRow = HistoryEntry & { familyName?: string; categoryLabel?: string };

export default function PointsHistoryPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Toutes les catégories");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<HistoryRow | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    data: apiHistory,
    loading,
    error,
    reload,
  } = useApiData<{ total: number; items: EntryDto[] }>(() => api.rankings.history({ take: 500 }), {
    total: 0,
    items: [],
  });

  const { data: apiFamilies } = useApiData<{ total: number; items: AdminFamilyDto[] }>(
    () => api.families.list({ take: 300 }),
    { total: 0, items: [] },
  );

  const { data: apiPenalties } = useApiData<PenaltyDto[]>(() => api.rankings.penalties(), []);

  const { data: apiRules } = useApiData<RankingRuleDto[]>(() => api.rankings.rules(), []);

  const penaltyReasonOptions = USE_MOCK
    ? REASONS
    : ["Autre", ...Array.from(new Set(apiPenalties.map((p) => p.reason)))];

  const penaltyCategoryOptions = USE_MOCK
    ? ["Toutes les catégories", ...CATEGORIES.map((c) => ruleCategoryLabel(c))]
    : ["Toutes les catégories", ...Array.from(new Set(apiRules.map((r) => ruleCategoryLabel(r.category))))];

  useEffect(() => {
    if (USE_MOCK) return;
    // In mock mode we use historyEntries from data.ts
  }, [apiHistory]);

  const rows = USE_MOCK
    ? historyEntries.map((entry) => ({
        ...entry,
        categoryLabel: ruleCategoryLabel(entry.category),
      }))
    : apiHistory.items.map((entry) => {
        const isPenalty = entry.category === "penalty" && entry.points < 0;
        const isRevoked = entry.points > 0 && entry.reason.startsWith("Annulation");
        return {
          id: entry.id,
          person: entry.personName,
          category: entry.category,
          points: entry.points,
          reason: entry.reason,
          match: entry.matchId ? `Match ${entry.matchId.slice(0, 8)}` : "—",
          date: entry.createdAtUtc,
          isPenalty,
          isRevoked,
          categoryLabel: ruleCategoryLabel(entry.category),
        };
      });

  const familyOptions = apiFamilies.items.map((family) => family.name);
  const personOptions = people.map((person) => person.name);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchSearch = `${row.person} ${row.reason} ${row.match}`.toLowerCase().includes(needle);
      const matchCategory = categoryFilter === "Toutes les catégories" || row.categoryLabel === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [rows, search, categoryFilter]);

  const openCreate = () => {
    setEditing(null);
    setDrawerOpen(true);
  };

  const openEdit = (row: HistoryRow) => {
    if (!row.isPenalty && !row.isRevoked) {
      toast.error("Seules les pénalités peuvent être modifiées.");
      return;
    }
    setEditing(row);
    setDrawerOpen(true);
  };

  const revoke = async (row: HistoryRow) => {
    if (
      !window.confirm(`Révoquer cet ajustement de ${row.points > 0 ? "+" : ""}${row.points} pts pour ${row.person} ?`)
    )
      return;
    try {
      // In real API, we'd call revokePenalty with the entry ID
      if (USE_MOCK) {
        toast.success("L'ajustement a été révoqué (simulation).");
      } else {
        await api.rankings.revokePenalty(row.id);
        await reload();
        toast.success("L'ajustement a été révoqué.");
      }
    } catch (cause) {
      toast.error(errorMessage(cause));
    }
  };

  const save = async (payload: {
    personId: string | null;
    target: string;
    points: number;
    reason: string;
    category: string;
    matchId?: string | null;
  }) => {
    if (!Number.isFinite(payload.points) || payload.points === 0) {
      toast.error("Saisissez un nombre de points non nul.");
      return;
    }

    if (USE_MOCK) {
      toast.success(
        `L'ajustement de ${payload.points > 0 ? "+" : ""}${payload.points} points a été appliqué à ${payload.target}.`,
      );
      setDrawerOpen(false);
      setEditing(null);
      return;
    }

    if (!payload.personId) {
      toast.error("Sélectionnez une personne.");
      return;
    }

    setSaving(true);
    try {
      await api.rankings.createPenalty({
        personId: payload.personId,
        points: payload.points,
        reason: payload.reason,
        matchId: payload.matchId ?? null,
      });
      await reload();
      toast.success("L'ajustement de points a été appliqué.");
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
        id="tour-history-header"
        eyebrow="Modération"
        title="Historique des points"
        description="Consultez tous les ajustements de points, pénalités et révocations."
        action={{ label: "Ajouter des points", icon: Plus, onClick: openCreate }}
      />

      <Filters
        id="tour-history-filters"
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Rechercher une personne, un motif, un match…"
        selects={[
          { label: "Catégorie", value: categoryFilter, options: penaltyCategoryOptions, onChange: setCategoryFilter },
        ]}
        onReset={() => {
          setSearch("");
          setCategoryFilter("Toutes les catégories");
        }}
      />

      {!USE_MOCK && error && (
        <div className="mb-4 rounded-xl bg-danger-soft px-4 py-3 text-[12px] font-medium text-danger">{error}</div>
      )}

      <DataTable
        id="tour-history-table"
        rows={filtered}
        rowKey={(row) => row.id}
        minWidth={1100}
        grid="1.2fr 1fr 1.5fr .8fr 1.2fr 1fr 1fr 1fr 36px"
        emptyMessage={loading ? "Chargement de l'historique…" : undefined}
        columns={[
          {
            key: "person",
            label: "Personne",
            render: (row) => (
              <span className="flex items-center gap-2.5">
                <InitialsAvatar
                  name={row.person}
                  tone={row.isPenalty ? "orange" : row.isRevoked ? "purple" : "green"}
                  size="sm"
                />
                <strong className="truncate">{row.person}</strong>
              </span>
            ),
          },
          {
            key: "categoryLabel",
            label: "Catégorie",
            render: (row) => (
              <Status tone={row.isPenalty ? "danger" : row.isRevoked ? "warning" : "success"}>
                {row.categoryLabel}
              </Status>
            ),
          },
          { key: "reason", label: "Motif / Raison", render: (row) => <span className="truncate">{row.reason}</span> },
          {
            key: "points",
            label: "Points",
            render: (row) => (
              <span
                className={cn(
                  "font-bold",
                  row.points < 0 ? "text-danger" : row.isRevoked ? "text-warning" : "text-green",
                )}
              >
                {row.points > 0 && !row.isRevoked ? "+" : ""}
                {row.points}
              </span>
            ),
          },
          { key: "match", label: "Match", render: (row) => <span className="text-soft truncate">{row.match}</span> },
          { key: "date", label: "Date", render: (row) => <span className="text-soft">{row.date}</span> },
          {
            key: "type",
            label: "Type",
            render: (row) =>
              row.isRevoked ? (
                <Status tone="warning">Révocation</Status>
              ) : row.isPenalty ? (
                <Status tone="danger">Pénalité</Status>
              ) : (
                <Status tone="success">Bonus</Status>
              ),
          },
          {
            key: "actions",
            label: "",
            render: (row) => (
              <div className="flex items-center gap-1.5 justify-center">
                {row.isPenalty && !row.isRevoked && (
                  <button
                    onClick={() => revoke(row)}
                    aria-label={`Révoquer l'ajustement de ${row.person}`}
                    title="Révoquer"
                    className="grid size-8 place-items-center rounded-lg text-soft transition hover:bg-danger-soft hover:text-danger"
                  >
                    <Undo2 size={16} />
                  </button>
                )}
                <button
                  onClick={() => openEdit(row)}
                  aria-label="Modifier"
                  className="grid size-8 place-items-center rounded-lg text-soft transition hover:bg-muted"
                >
                  <Filter size={16} />
                </button>
              </div>
            ),
          },
        ]}
      />

      <FormSheet
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditing(null);
        }}
        title={editing ? "Modifier l'ajustement" : "Ajouter des points"}
        subtitle={editing ? editing.person : "Nouvel ajustement manuel"}
        footer={
          <FormSheetFooter
            onCancel={() => {
              setDrawerOpen(false);
              setEditing(null);
            }}
            submitLabel={saving ? "Enregistrement…" : editing ? "Enregistrer" : "Créer l'ajustement"}
            form="history-form"
          />
        }
      >
        {drawerOpen && (
          <HistoryForm
            key={editing?.id ?? "new"}
            row={editing}
            live={!USE_MOCK}
            familyOptions={familyOptions}
            personOptions={personOptions}
            categoryOptions={CATEGORIES}
            onSave={save}
          />
        )}
      </FormSheet>
    </>
  );
}

interface HistoryFormProps {
  row: HistoryRow | null;
  live: boolean;
  familyOptions: string[];
  personOptions: string[];
  categoryOptions: string[];
  onSave: (payload: {
    personId: string | null;
    target: string;
    points: number;
    reason: string;
    category: string;
    matchId?: string | null;
  }) => void;
}

function HistoryForm({ row, live, familyOptions, personOptions, categoryOptions, onSave }: HistoryFormProps) {
  const [person, setPerson] = useState(row?.person ?? (live ? (personOptions[0] ?? "") : personOptions[0]));
  const [category, setCategory] = useState(row?.category ?? "penalty");
  const [reason, setReason] = useState(row?.reason ?? "");
  const [points, setPoints] = useState(row ? `${row.points > 0 ? "+" : ""}${row.points}` : "-10");
  const [matchId, setMatchId] = useState("");

  return (
    <form
      id="history-form"
      onSubmit={(event) => {
        event.preventDefault();
        const parsedPoints = Number(points.replace(",", ".").replace(/[^\d.+-]/g, ""));
        const personId = live ? (personOptions.find((p) => p === person) ? person : null) : null;
        onSave({
          personId: personId ?? null,
          target: person,
          points: parsedPoints,
          reason: reason,
          category,
          matchId: matchId || null,
        });
      }}
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-1 gap-3.5">
        <Field>
          <FieldLabel htmlFor="pointshistory-field-18" className="text-[11px] font-bold text-muted-foreground">
            {live ? "Personne" : "Personne"}
          </FieldLabel>
          <OptionSelect
            id="pointshistory-field-18"
            value={person}
            onValueChange={setPerson}
            options={live ? familyOptions : personOptions}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="pointshistory-field-19" className="text-[11px] font-bold text-muted-foreground">
            Catégorie
          </FieldLabel>
          <OptionSelect
            id="pointshistory-field-19"
            value={category}
            onValueChange={setCategory}
            options={categoryOptions}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="pointshistory-field-20" className="text-[11px] font-bold text-muted-foreground">
            Motif
          </FieldLabel>
          <Input
            id="pointshistory-field-20"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Saisissez le motif"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="pointshistory-field-21" className="text-[11px] font-bold text-muted-foreground">
            Points
          </FieldLabel>
          <Input
            id="pointshistory-field-21"
            value={points}
            onChange={(event) => setPoints(event.target.value)}
            inputMode={live ? "numeric" : "text"}
            type={live ? "number" : "text"}
          />
          <FieldDescription className="text-[10px]">
            {live ? "Un nombre négatif retire des points." : undefined}
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="pointshistory-field-22" className="text-[11px] font-bold text-muted-foreground">
            Match (optionnel)
          </FieldLabel>
          <Input
            id="pointshistory-field-22"
            value={matchId}
            onChange={(event) => setMatchId(event.target.value)}
            placeholder="ID du match (laisser vide si aucun)"
          />
        </Field>
      </div>

      <div className="rounded-xl bg-brand-soft px-3.5 py-3 text-[11px] leading-relaxed text-[#8e4200] dark:text-[#ffc48f]">
        {live
          ? "L'ajustement crée une entrée dans l'historique des points et envoie une notification à la personne concernée. Les points positifs = bonus, points négatifs = pénalité."
          : "L'ajustement manuel est tracé dans l'historique et s'applique immédiatement au classement."}
      </div>
    </form>
  );
}
