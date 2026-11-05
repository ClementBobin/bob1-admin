"use client";

import { useState } from "react";
import { MoreHorizontal, Plus, TrendingUp, Users, User, ChevronDown } from "lucide-react";
import { personRankingToRow, familyRankingToRow } from "@/lib/adapters";
import { api, errorMessage } from "@/lib/api";
import { useApiData } from "@/hooks/use-api-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { OptionSelect } from "@/components/shared/option-select";
import { InitialsAvatar } from "@/components/shared/initials-avatar";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/layout/page-header";
import { FormSheet, FormSheetFooter } from "@/components/shared/form-sheet";
import { POINT_CATEGORIES, POINT_CATEGORY_LABELS } from "@/lib/constants";
import { ErrorBanner } from "@/components/shared/error-banner";
import type { FamilyRankingRow, FamilyRankingRowDto, PersonDto, PersonRankingRow, PersonRankingRowDto, PointCategory } from "@/types";

type ViewMode = "person" | "family";

type PersonRankingsData = { rows: PersonRankingRow[]; season: string };
type FamilyRankingsData = { rows: FamilyRankingRow[]; season: string };

export default function RankingsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("person");
  const [category, setCategory] = useState<PointCategory>("staff");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const isPersonView = viewMode === "person";

  const {
    data: personData,
    loading: personLoading,
    error: personError,
    reload: reloadPerson,
  } = useApiData<PersonRankingsData>(
    () =>
      api.rankings.get(category, "person").then((response) => {
        const r = response as { top: PersonRankingRowDto[]; season: string };
        return { rows: r.top.map(personRankingToRow), season: r.season };
      }),
    [category, viewMode],
  );

  const {
    data: familyData,
    loading: familyLoading,
    error: familyError,
    reload: reloadFamily,
  } = useApiData<FamilyRankingsData>(
    () =>
      api.rankings.get(category, "family").then((response) => {
        const r = response as { top: FamilyRankingRowDto[]; season: string };
        return { rows: r.top.map(familyRankingToRow), season: r.season };
      }),
    [category, viewMode],
  );

  const { data: apiPerson } = useApiData<{ total: number; items: PersonDto[] }>(
    () => api.people.list({ take: 300 }),
    [],
  )

  const rows = isPersonView ? personData?.rows ?? [] : familyData?.rows ?? [];
  const loading = isPersonView ? personLoading : familyLoading;
  const error = isPersonView ? personError : familyError;
  const reload = isPersonView ? reloadPerson : reloadFamily;

  return (
    <>
      <PageHeader
        id="tour-rankings-header"
        eyebrow={`Saison ${isPersonView ? personData?.season : familyData?.season}`}
        title="Classements"
        description={isPersonView ? "Suivez les points par personne." : "Suivez les points par famille (agrégés)."}
        action={{ label: "Voir l'historique", icon: Plus, onClick: () => (window.location.href = "/points-history") }}
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-line bg-card px-3 py-1.5">
          <User className="size-4 text-soft" />
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as ViewMode)}
            className="bg-transparent text-[12.5px] font-medium text-ink outline-none cursor-pointer"
          >
            <option value="person">Par personne</option>
            <option value="family">Par famille</option>
          </select>
          <ChevronDown className="size-4 text-soft" />
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-line bg-card px-3 py-1.5">
          <Users className="size-4 text-soft" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as PointCategory)}
            className="bg-transparent text-[12.5px] font-medium text-ink outline-none cursor-pointer"
          >
            {POINT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {POINT_CATEGORY_LABELS[cat]}
              </option>
            ))}
          </select>
          <ChevronDown className="size-4 text-soft" />
        </div>
      </div>

      <ErrorBanner message={error} />

      <DataTable
        id="tour-rankings-table"
        rows={rows}
        rowKey={(row) => {
          const r = row as (PersonRankingRow & { family?: string }) | (FamilyRankingRow & { person?: string });
          return `${r.rank}-${isPersonView ? r.person! : r.family!}`;
        }}
        minWidth={880}
        grid=".6fr 1.6fr 1fr 1fr 1fr 1fr 36px"
        rowClassName={(row) => (row.highlight ? "bg-mint/40 dark:bg-mint/10" : undefined)}
        emptyMessage={loading ? "Chargement du classement…" : undefined}
        columns={[
          {
            key: "rank",
            label: "Rang",
            render: (row) => (
              <span className="flex items-center gap-2">
                {row.rank <= 3 ? (
                  <b className="grid size-7 place-items-center rounded-[9px] bg-brand text-[11px] font-extrabold text-brand-foreground">
                    {row.rank}
                  </b>
                ) : (
                  <b className="w-7 text-center text-[12px] font-semibold text-soft">{row.rank}</b>
                )}
                {row.rank === 1 && <TrendingUp size={15} className="text-brand" />}
              </span>
            ),
          },
          {
            key: isPersonView ? "person" : "family",
            label: isPersonView ? "Personne" : "Famille",
            render: (row) => {
              const r = row as (PersonRankingRow & { family?: string }) | (FamilyRankingRow & { person?: string });
              return (
                <span className="flex items-center gap-2.5">
                  <InitialsAvatar
                    name={isPersonView ? r.person! : r.family!}
                    tone={r.highlight ? "orange" : "green"}
                    size="sm"
                  />
                  <strong className="truncate">{isPersonView ? r.person! : r.family!}</strong>
                  {isPersonView && r.family && <span className="text-[10px] text-soft">({r.family})</span>}
                </span>
              );
            },
          },
          {
            key: "points",
            label: "Points",
            render: (row) => (
              <span className={cn("font-bold", row.points < 0 ? "text-danger" : "text-green")}>
                {row.points > 0 ? "+" : ""}
                {row.points}
              </span>
            ),
          },
          {
            key: "details",
            label: "Détails",
            render: () => <span className="text-soft">—</span>,
          },
          { key: "total", label: "Total", render: (row) => <span className="font-extrabold">{row.points} pts</span> },
          {
            key: "actions",
            label: "",
            render: () => (
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground"
                onClick={() => setDrawerOpen(true)}
                aria-label="Ajuster les points"
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
        title="Ajouter des points"
        subtitle="Correction manuelle"
        footer={
          <FormSheetFooter
            onCancel={() => setDrawerOpen(false)}
            submitLabel={saving ? "Application…" : "Appliquer l'ajustement"}
            form="points-form"
          />
        }
      >
        {drawerOpen && (
          <PointsForm
            key={category}
            category={category}
            persons={apiPerson?.items ?? []}
            onSave={async (payload) => {
              if (!Number.isFinite(payload.points) || payload.points === 0) {
                toast.error("Saisissez un nombre de points non nul.");
                return;
              }
              if (!payload.personId) {
                toast.error("Sélectionnez une personne/famille.");
                return;
              }
              setSaving(true);
              try {
                await api.rankings.createPenalty({
                  personId: payload.personId,
                  points: payload.points,
                  reason: payload.reason,
                });
                await reload();
                toast.success("L'ajustement de points a été appliqué.");
                setDrawerOpen(false);
              } catch (cause) {
                toast.error(errorMessage(cause));
              } finally {
                setSaving(false);
              }
            }}
          />
        )}
      </FormSheet>
    </>
  );
}

interface PointsFormProps {
  category: PointCategory;
  persons: PersonDto[];
  onSave: (payload: { personId: string | null; target: string; points: number; reason: string }) => void;
}

function PointsForm({ category, persons, onSave }: PointsFormProps) {
  const [target, setTarget] = useState(persons[0]?.id ?? "");
  const [points, setPoints] = useState("5");
  const [motif, setMotif] = useState("Participation exceptionnelle");
  const personOptions = persons.map((person) => person.id);

  return (
    <form
      id="points-form"
      onSubmit={(event) => {
        event.preventDefault();
        const parsed = Number(points.replace(",", ".").replace(/[^\d.+-]/g, ""));
        const personOptions = persons.map((person) => person.id);
        const personId = personOptions.find((item) => item === target) ?? null;
        onSave({ personId, target, points: parsed, reason: motif });
      }}
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-1 gap-3.5">
        <Field>
          <FieldLabel htmlFor="rankings-field-23" className="text-[11px] font-bold text-muted-foreground">
            Personne
          </FieldLabel>
            <OptionSelect value={target} onValueChange={setTarget} options={personOptions} />
        </Field>
        <Field>
          <FieldLabel htmlFor="rankings-field-24" className="text-[11px] font-bold text-muted-foreground">
            Catégorie
          </FieldLabel>
          <Input id="rankings-field-24" value={POINT_CATEGORY_LABELS[category] ?? category} readOnly />
        </Field>
        <Field>
          <FieldLabel htmlFor="rankings-field-25" className="text-[11px] font-bold text-muted-foreground">
            Points
          </FieldLabel>
          <Input
            id="rankings-field-25"
            value={points}
            onChange={(event) => setPoints(event.target.value)}
            inputMode="numeric"
            type="number"
          />
          <FieldDescription className="text-[10px]">
            Un nombre négatif retire des points.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="rankings-field-26" className="text-[11px] font-bold text-muted-foreground">
            Motif
          </FieldLabel>
          <Input id="rankings-field-26" value={motif} onChange={(event) => setMotif(event.target.value)} />
        </Field>
      </div>

      <div className="rounded-xl bg-brand-soft px-3.5 py-3 text-[11px] leading-relaxed text-[#8e4200] dark:text-[#ffc48f]">
        L'ajustement crée une entrée dans l'historique des points et envoie une notification.
      </div>
    </form>
  );
}
