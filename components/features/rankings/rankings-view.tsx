"use client";

import { useState } from "react";
import { Plus, TrendingUp } from "lucide-react";
import { personRankingToRow, familyRankingToRow } from "@/lib/adapters";
import { api, errorMessage } from "@/lib/api";
import { useApiData } from "@/hooks/use-api-data";
import { usePagedQuery } from "@/hooks/use-paged-query";
import { useLookups } from "@/hooks/use-lookups";
import { cn, pointsAdjustmentError } from "@/lib/utils";
import { toast } from "sonner";
import { RowActionButton } from "@/components/shared/row-action-button";
import { useFormSheet } from "@/hooks/use-form-sheet";
import { POINTS_FORM_ID, PointsForm } from "./points-form";
import { InitialsAvatar } from "@/components/shared/initials-avatar";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/layout/page-header";
import { FormSheet, FormSheetFooter } from "@/components/shared/form-sheet";
import { ErrorBanner } from "@/components/shared/error-banner";
import { OptionSelect } from "@/components/shared/option-select";
import type {
  FamilyRankingRow,
  FamilyRankingResponse,
  Paged,
  PersonDto,
  PersonRankingRow,
  PointCategory,
  RankingResponse,
  RankingViewMode,
} from "@/types";

const VIEW_LABELS = { person: "Par personne", family: "Par famille" };

export function RankingsView() {
  const { pointCategoryKeys, pointCategoryLabel } = useLookups();
  const [viewMode, setRankingViewMode] = useState<RankingViewMode>("person");
  const [selectedCategory, setCategory] = useState<PointCategory>("");
  const category = selectedCategory || pointCategoryKeys[0] || "";
  const sheet = useFormSheet<null>();
  const [saving, setSaving] = useState(false);

  const isPersonView = viewMode === "person";

  const [season, setSeason] = useState("");

  const query = usePagedQuery<
    PersonRankingRow | FamilyRankingRow,
    { category: string; view: RankingViewMode }
  >(
    async (params) => {
      if (!params.category) return { items: [], total: 0 };
      const response = await api.rankings.get(params);
      setSeason(response.season);
      return params.view === "person"
        ? {
            items: (response as RankingResponse).top.map(personRankingToRow),
            total: response.total,
          }
        : {
            items: (response as FamilyRankingResponse).top.map(
              familyRankingToRow,
            ),
            total: response.total,
          };
    },
    { category, view: viewMode },
  );

  const { data: apiPerson } = useApiData<Paged<PersonDto>>(
    () => api.people.list({ take: 300 }),
    [],
  );

  const { items: rows, loading, error, reload } = query;

  return (
    <>
      <PageHeader
        id="tour-rankings-header"
        eyebrow={`Saison ${season}`}
        title="Classements"
        description={
          isPersonView
            ? "Suivez les points par personne."
            : "Suivez les points par famille (agrégés)."
        }
        action={{
          label: "Voir l'historique",
          icon: Plus,
          onClick: () => (window.location.href = "/points-history"),
        }}
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <OptionSelect
          aria-label="Mode d'affichage"
          value={viewMode === "family" ? VIEW_LABELS.family : VIEW_LABELS.person}
          onValueChange={(label) =>
            setRankingViewMode(label === VIEW_LABELS.family ? "family" : "person")
          }
          options={[VIEW_LABELS.person, VIEW_LABELS.family]}
          className="w-auto min-w-37.5 text-[12px] font-medium"
        />
        <OptionSelect
          aria-label="Catégorie de points"
          value={category ? pointCategoryLabel(category) : ""}
          onValueChange={(label) =>
            setCategory(
              pointCategoryKeys.find((key) => pointCategoryLabel(key) === label) ?? category,
            )
          }
          options={pointCategoryKeys.map((key) => pointCategoryLabel(key))}
          className="w-auto min-w-37.5 text-[12px] font-medium"
        />
      </div>

      <ErrorBanner message={error} />

      <DataTable
        id="tour-rankings-table"
        rows={rows}
        server={{
          total: query.total,
          page: query.page,
          onPageChange: query.setPage,
        }}
        pageSize={query.pageSize}
        rowKey={(row) => {
          const r = row as
            | (PersonRankingRow & { family?: string })
            | (FamilyRankingRow & { person?: string });
          return `${r.rank}-${isPersonView ? r.person! : r.family!}`;
        }}
        minWidth={880}
        grid=".6fr 1.6fr 1fr 1fr 1fr 1fr 36px"
        rowClassName={(row) =>
          row.highlight ? "bg-mint/40 dark:bg-mint/10" : undefined
        }
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
                  <b className="w-7 text-center text-[12px] font-semibold text-soft">
                    {row.rank}
                  </b>
                )}
                {row.rank === 1 && (
                  <TrendingUp size={15} className="text-brand" />
                )}
              </span>
            ),
          },
          {
            key: isPersonView ? "person" : "family",
            label: isPersonView ? "Personne" : "Famille",
            render: (row) => {
              const r = row as
                | (PersonRankingRow & { family?: string })
                | (FamilyRankingRow & { person?: string });
              return (
                <span className="flex items-center gap-2.5">
                  <InitialsAvatar
                    name={isPersonView ? r.person! : r.family!}
                    tone={r.highlight ? "orange" : "green"}
                    size="sm"
                  />
                  <strong className="truncate">
                    {isPersonView ? r.person! : r.family!}
                  </strong>
                  {isPersonView && r.family && (
                    <span className="text-[10px] text-soft">({r.family})</span>
                  )}
                </span>
              );
            },
          },
          {
            key: "points",
            label: "Points",
            render: (row) => (
              <span
                className={cn(
                  "font-bold",
                  row.points < 0 ? "text-danger" : "text-green",
                )}
              >
                {row.points > 0 ? "+" : ""}
                {row.points}
              </span>
            ),
          },
          {
            key: "total",
            label: "Total",
            render: (row) => (
              <span className="font-extrabold">{row.points} pts</span>
            ),
          },
          {
            key: "actions",
            label: "",
            render: () => (
              <RowActionButton
                onClick={sheet.openCreate}
                label="Ajuster les points"
              />
            ),
          },
        ]}
      />

      <FormSheet
        open={sheet.open}
        onClose={sheet.close}
        title="Ajouter des points"
        subtitle="Correction manuelle"
        footer={
          <FormSheetFooter
            onCancel={sheet.close}
            submitLabel={saving ? "Application…" : "Appliquer l'ajustement"}
            form={POINTS_FORM_ID}
          />
        }
      >
        {sheet.open && (
          <PointsForm
            key={category}
            category={category}
            persons={apiPerson?.items ?? []}
            onSave={async (payload) => {
              const invalid = pointsAdjustmentError(
                payload,
                "une personne/famille",
              );
              if (invalid) {
                toast.error(invalid);
                return;
              }
              if (!payload.personId) return;
              setSaving(true);
              try {
                await api.rankings.createPenalty({
                  personId: payload.personId,
                  points: payload.points,
                  reason: payload.reason,
                  category,
                });
                await reload();
                toast.success("L'ajustement de points a été appliqué.");
                sheet.close();
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
