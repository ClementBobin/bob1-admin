"use client";

import { useState } from "react";
import { Pencil, Plus, Undo2 } from "lucide-react";
import { api, errorMessage } from "@/lib/api";
import { useApiData } from "@/hooks/use-api-data";
import { useSeason } from "@/components/season/season-provider";
import { usePagedQuery } from "@/hooks/use-paged-query";
import { useLookups } from "@/hooks/use-lookups";
import { cn, formatDateTime, fullName, pointsAdjustmentError } from "@/lib/utils";
import { useFormSheet } from "@/hooks/use-form-sheet";
import { HISTORY_FORM_ID, HistoryForm } from "./history-form";
import { toast } from "sonner";
import { InitialsAvatar } from "@/components/shared/initials-avatar";
import { Status } from "@/components/shared/status";
import { DataTable } from "@/components/shared/data-table";
import { Filters } from "@/components/shared/filters";
import { PageHeader } from "@/components/layout/page-header";
import { FormSheet, FormSheetFooter } from "@/components/shared/form-sheet";
import { FILTER_ALL } from "@/lib/constants";
import { ErrorBanner } from "@/components/shared/error-banner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type {
  PersonDto,
  HistoryRow,
  PointsPayload,
  RankingRuleDto,
} from "@/types";

export function HistoryView() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(FILTER_ALL.categories);
  const sheet = useFormSheet<HistoryRow>();
  const [saving, setSaving] = useState(false);
  const [toRevoke, setToRevoke] = useState<HistoryRow | null>(null);

  const { pointCategoryKeys, pointCategoryLabel } = useLookups();

  const { season, isCurrent } = useSeason();
  const query = usePagedQuery((params) => api.rankings.history(params), {
    search,
    season: season || undefined,
    category:
      categoryFilter === FILTER_ALL.categories
        ? undefined
        : pointCategoryKeys.find(
            (key) => pointCategoryLabel(key) === categoryFilter,
          ),
  });
  const { items: apiHistory, loading, error, reload } = query;
  const { data: apiPeople } = useApiData<PersonDto[]>(
    () => api.people.all(),
    [],
  );
  const { data: apiRules } = useApiData<RankingRuleDto[]>(
    () => api.rankings.allRules(),
    [],
  );

  const penaltyCategoryOptions = [
    FILTER_ALL.categories,
    ...Array.from(
      new Set((apiRules ?? []).map((r) => pointCategoryLabel(r.category))),
    ),
  ];

  const rows = (apiHistory ?? []).map((entry) => {
    return {
      id: entry.id,
      person: entry.personName,
      category: entry.category,
      points: entry.points,
      reason: entry.reason,
      match: entry.matchId ? `Match ${entry.matchId.slice(0, 8)}` : "—",
      date: entry.createdAtUtc,
      isPenalty: entry.points < 0,
      isManual: entry.isManual,
      isRevoked: entry.isRevoked,
      isRevocation: !entry.isManual && entry.reason.startsWith("Annulation"),
      categoryLabel: pointCategoryLabel(entry.category),
    };
  });

  const personOptions = (apiPeople ?? []).map((person) =>
    fullName(person.firstName, person.lastName),
  );

  const revoke = async () => {
    if (!toRevoke) return;
    try {
      await api.rankings.revokePoints(toRevoke.id);
      await reload();
      toast.success("L'ajustement a été révoqué.");
    } catch (cause) {
      toast.error(errorMessage(cause));
    } finally {
      setToRevoke(null);
    }
  };

  const save = async (payload: PointsPayload) => {
    const personId = (apiPeople ?? []).find(
      (person) =>
        fullName(person.firstName, person.lastName) === payload.target,
    )?.id;
    const invalid = pointsAdjustmentError({
      ...payload,
      personId: personId ?? null,
    });
    if (invalid || !personId) {
      toast.error(invalid ?? "Sélectionnez une personne.");
      return;
    }

    setSaving(true);
    try {
      const category = pointCategoryKeys.find(
        (key) => pointCategoryLabel(key) === payload.category,
      );
      if (!category) {
        toast.error("Sélectionnez une catégorie.");
        return;
      }
      if (sheet.editing) {
        await api.rankings.updatePoints(sheet.editing.id, {
          category,
          points: payload.points,
          reason: payload.reason,
        });
      } else {
        await api.rankings.createPenalty({
          personId,
          category,
          points: payload.points,
          reason: payload.reason,
        });
      }
      await reload();
      toast.success(
        sheet.editing
          ? "L'ajustement a été modifié."
          : "L'ajustement de points a été appliqué.",
      );
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
        description="Consultez tous les ajustements de points. Les lignes créées manuellement peuvent être modifiées ou révoquées."
        action={
          isCurrent
            ? { label: "Ajouter des points", icon: Plus, onClick: sheet.openCreate }
            : undefined
        }
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
        rows={rows}
        server={{
          total: query.total,
          page: query.page,
          onPageChange: query.setPage,
        }}
        pageSize={query.pageSize}
        rowKey={(row) => row.id}
        minWidth={1200}
        grid="1.2fr 1fr 1.5fr .8fr 1fr 1fr .9fr 76px"
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
                      : row.isRevoked || row.isRevocation
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
                    : row.isRevoked || row.isRevocation
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
                    : row.isRevoked || row.isRevocation
                      ? "text-warning"
                      : "text-green",
                )}
              >
                {row.points > 0 ? "+" : ""}
                {row.points}
              </span>
            ),
          },
          {
            key: "date",
            label: "Date",
            render: (row) => <span className="text-soft">{formatDateTime(row.date)}</span>,
          },
          {
            key: "type",
            label: "Type",
            render: (row) =>
              row.isRevoked ? (
                <Status tone="warning">Révoquée</Status>
              ) : row.isRevocation ? (
                <Status tone="warning">Révocation</Status>
              ) : row.isPenalty ? (
                <Status tone="danger">Pénalité</Status>
              ) : (
                <Status tone="success">Bonus</Status>
              ),
          },
          {
            key: "origin",
            label: "Origine",
            render: (row) =>
              row.isManual ? (
                <Status tone="info">Manuelle</Status>
              ) : (
                <Status tone="neutral">Automatique</Status>
              ),
          },
          {
            key: "actions",
            label: "",
            render: (row) =>
              isCurrent && row.isManual && !row.isRevoked ? (
                <div className="flex items-center justify-center gap-1.5">
                  <button
                    onClick={() => sheet.openEdit(row)}
                    aria-label={`Modifier l'ajustement de ${row.person}`}
                    title="Modifier"
                    className="grid size-8 place-items-center rounded-lg text-soft transition hover:bg-muted"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setToRevoke(row)}
                    aria-label={`Révoquer l'ajustement de ${row.person}`}
                    title="Révoquer"
                    className="grid size-8 place-items-center rounded-lg text-soft transition hover:bg-danger-soft hover:text-danger"
                  >
                    <Undo2 size={16} />
                  </button>
                </div>
              ) : null,
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
            categoryOptions={pointCategoryKeys.map((key) => pointCategoryLabel(key))}
            onSave={save}
          />
        )}
      </FormSheet>

      <AlertDialog
        open={toRevoke !== null}
        onOpenChange={(open) => !open && setToRevoke(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Révoquer cet ajustement ?</AlertDialogTitle>
            <AlertDialogDescription>
              {toRevoke
                ? `${toRevoke.points > 0 ? "+" : ""}${toRevoke.points} pts pour ${toRevoke.person} (${toRevoke.reason}). `
                : ""}
              Une ligne opposée sera ajoutée à l'historique et l'ajustement ne
              pourra plus être modifié.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Retour</AlertDialogCancel>
            <AlertDialogAction onClick={revoke}>Révoquer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
