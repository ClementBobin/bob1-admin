"use client";

import { useMemo, useState } from "react";
import { Filter, Plus, Undo2 } from "lucide-react";
import { ruleCategoryLabel } from "@/lib/adapters";
import { api, errorMessage } from "@/lib/api";
import { useApiData } from "@/hooks/use-api-data";
import { cn, matchesSearch, pointsAdjustmentError } from "@/lib/utils";
import { useFormSheet } from "@/hooks/use-form-sheet";
import { HISTORY_FORM_ID, HistoryForm } from "./history-form";
import { toast } from "sonner";
import { InitialsAvatar } from "@/components/shared/initials-avatar";
import { Status } from "@/components/shared/status";
import { DataTable } from "@/components/shared/data-table";
import { Filters } from "@/components/shared/filters";
import { PageHeader } from "@/components/layout/page-header";
import { FormSheet, FormSheetFooter } from "@/components/shared/form-sheet";
import { FILTER_ALL, POINT_CATEGORIES } from "@/lib/constants";
import { ErrorBanner } from "@/components/shared/error-banner";
import type {
  EntryDto,
  HistoryRow,
  PointsPayload,
  RankingRuleDto,
} from "@/types";

export function HistoryView() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(FILTER_ALL.categories);
  const sheet = useFormSheet<HistoryRow>();
  const [saving, setSaving] = useState(false);

  const {
    data: apiHistory,
    loading,
    error,
    reload,
  } = useApiData<EntryDto[]>(
    async () => (await api.rankings.history({ take: 500 })).items,
    [],
  );

  const { data: apiRules } = useApiData<RankingRuleDto[]>(
    () => api.rankings.rules(),
    [],
  );

  const penaltyCategoryOptions = [
    FILTER_ALL.categories,
    ...Array.from(
      new Set((apiRules ?? []).map((r) => ruleCategoryLabel(r.category))),
    ),
  ];

  const rows = (apiHistory ?? []).map((entry) => {
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

  const personOptions = Array.from(
    new Set((apiHistory ?? []).map((entry) => entry.personName)),
  );

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      const matchSearch = matchesSearch(
        search,
        row.person,
        row.reason,
        row.match,
      );
      const matchCategory =
        categoryFilter === FILTER_ALL.categories ||
        row.categoryLabel === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [rows, search, categoryFilter]);

  const openEdit = (row: HistoryRow) => {
    if (!row.isPenalty && !row.isRevoked) {
      toast.error(
        "Seules les pénalités et les points donnés par un admin peuvent être modifiés.",
      );
      return;
    }
    sheet.openEdit(row);
  };

  const revoke = async (row: HistoryRow) => {
    if (
      !window.confirm(
        `Révoquer cet ajustement de ${row.points > 0 ? "+" : ""}${row.points} pts pour ${row.person} ?`,
      )
    )
      return;
    try {
      await api.rankings.revokePenalty(row.id);
      await reload();
      toast.success("L'ajustement a été révoqué.");
    } catch (cause) {
      toast.error(errorMessage(cause));
    }
  };

  const save = async (payload: PointsPayload) => {
    const invalid = pointsAdjustmentError(payload);
    if (invalid || !payload.personId) {
      toast.error(invalid ?? "Sélectionnez une personne.");
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
      sheet.close();
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
        action={{
          label: "Ajouter des points",
          icon: Plus,
          onClick: sheet.openCreate,
        }}
      />

      <Filters
        id="tour-history-filters"
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Rechercher une personne, un motif, un match…"
        selects={[
          {
            label: "Catégorie",
            value: categoryFilter,
            options: penaltyCategoryOptions,
            onChange: setCategoryFilter,
          },
        ]}
        onReset={() => {
          setSearch("");
          setCategoryFilter(FILTER_ALL.categories);
        }}
      />

      <ErrorBanner message={error} />

      <DataTable
        id="tour-history-table"
        rows={filtered}
        rowKey={(row) => row.id}
        minWidth={1100}
        grid="1.2fr 1fr 1.5fr .8fr 1fr 1fr 36px"
        emptyMessage={loading ? "Chargement de l'historique…" : undefined}
        columns={[
          {
            key: "person",
            label: "Personne",
            render: (row) => (
              <span className="flex items-center gap-2.5">
                <InitialsAvatar
                  name={row.person}
                  tone={
                    row.isPenalty
                      ? "orange"
                      : row.isRevoked
                        ? "purple"
                        : "green"
                  }
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
              <Status
                tone={
                  row.isPenalty
                    ? "danger"
                    : row.isRevoked
                      ? "warning"
                      : "success"
                }
              >
                {row.categoryLabel}
              </Status>
            ),
          },
          {
            key: "reason",
            label: "Motif / Raison",
            render: (row) => <span className="truncate">{row.reason}</span>,
          },
          {
            key: "points",
            label: "Points",
            render: (row) => (
              <span
                className={cn(
                  "font-bold",
                  row.points < 0
                    ? "text-danger"
                    : row.isRevoked
                      ? "text-warning"
                      : "text-green",
                )}
              >
                {row.points > 0 && !row.isRevoked ? "+" : ""}
                {row.points}
              </span>
            ),
          },
          {
            key: "date",
            label: "Date",
            render: (row) => <span className="text-soft">{row.date}</span>,
          },
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
                {(row.isPenalty || row.isRevoked) && (
                  <button
                    onClick={() => openEdit(row)}
                    aria-label="Modifier"
                    className="grid size-8 place-items-center rounded-lg text-soft transition hover:bg-muted"
                  >
                    <Filter size={16} />
                  </button>
                )}
              </div>
            ),
          },
        ]}
      />

      <FormSheet
        open={sheet.open}
        onClose={sheet.close}
        title={sheet.editing ? "Modifier l'ajustement" : "Ajouter des points"}
        subtitle={
          sheet.editing ? sheet.editing.person : "Nouvel ajustement manuel"
        }
        footer={
          <FormSheetFooter
            onCancel={sheet.close}
            submitLabel={
              saving
                ? "Enregistrement…"
                : sheet.editing
                  ? "Enregistrer"
                  : "Créer l'ajustement"
            }
            form={HISTORY_FORM_ID}
          />
        }
      >
        {sheet.open && (
          <HistoryForm
            key={sheet.editing?.id ?? "new"}
            row={sheet.editing}
            personOptions={personOptions}
            categoryOptions={POINT_CATEGORIES}
            onSave={save}
          />
        )}
      </FormSheet>
    </>
  );
}
