"use client";

import { useEffect, useState } from "react";
import { Info, Save, ShieldCheck } from "lucide-react";
import { ruleToRow } from "@/lib/adapters";
import { api, errorMessage } from "@/lib/api";
import { useApiData } from "@/hooks/use-api-data";
import { useLookups } from "@/hooks/use-lookups";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PointsInput } from "./points-input";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/layout/page-header";
import { ErrorBanner } from "@/components/shared/error-banner";
import type { RankingRuleDto } from "@/types";

export function RulesView() {
  const { pointCategoryLabel } = useLookups();
  const [liveRows, setLiveRows] = useState<RankingRuleDto[]>([]);
  const [dirty, setDirty] = useState(false);
  const [dirtyKeys, setDirtyKeys] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  const { data: apiRules, loading, error, reload } = useApiData<RankingRuleDto[]>(
    () => api.rankings.allRules(),
    [],
  );

  useEffect(() => {
    setLiveRows(apiRules ?? []);
    setDirtyKeys({});
    setDirty(false);
  }, [apiRules]);

  const updateLive = (key: string, field: "points" | "pointsJ15" | "pointsJ4", value: string) => {
    if (value === "" || value === "-" || value === "+") return;
    const parsed = Math.max(-1000, Math.min(1000, Math.round(Number(value) || 0)));
    setLiveRows((current) => current.map((row) => (row.key === key ? { ...row, [field]: parsed } : row)));
    setDirtyKeys((current) => ({ ...current, [key]: true }));
    setDirty(true);
  };

  const save = async () => {
    const changed = liveRows.filter((row) => dirtyKeys[row.key]);
    if (changed.length === 0) {
      setDirty(false);
      return;
    }

    setSaving(true);
    try {
      for (const row of changed) {
        await api.rankings.updateRule(
          row.key,
          row.points,
          row.label,
          row.hasJ15J4 ? (row.pointsJ15 ?? undefined) : undefined,
          row.hasJ15J4 ? (row.pointsJ4 ?? undefined) : undefined,
        );
      }
      await reload();
      setDirtyKeys({});
      setDirty(false);
      toast.success("Les règles de points ont été enregistrées.");
    } catch (cause) {
      toast.error(errorMessage(cause));
    } finally {
      setSaving(false);
    }
  };

  const renderPointsInput = (value: number | undefined, onChange: (value: string) => void) => (
    <PointsInput value={value ?? 0} onChange={onChange} />
  );

  return (
    <>
      <PageHeader
        id="tour-rules-header"
        eyebrow="Paramètres"
        title="Règles de points"
        description="Définissez les points attribués à chaque action du club. Certaines règles supportent J-15 / J-4."
      />

      <div className="mb-4 flex items-start gap-3 rounded-xl bg-mint px-4 py-3.5 text-mint-foreground">
        <ShieldCheck size={18} className="mt-0.5 shrink-0" />
        <div className="flex flex-col">
          <strong className="text-[12px]">Les règles s'appliquent aux nouvelles confirmations</strong>
          <small className="mt-0.5 text-[11px] opacity-80">
            Une modification n'affecte pas les points déjà attribués.
          </small>
        </div>
      </div>

      <ErrorBanner message={error} />

      <p className="mb-4 rounded-xl bg-muted px-4 py-3 text-[11px] leading-relaxed text-soft">
        Chaque règle utilise soit le système J-15/J-4 (points distincts selon le délai), soit une valeur de points
        standard unique.
      </p>

        <DataTable
          id="tour-rules-table"
          rows={liveRows.map(ruleToRow)}
          rowKey={(row) => row.key}
          minWidth={760}
          pageSize={10}
          grid="1.5fr 1.2fr 1fr .8fr 36px"
          emptyMessage={loading ? "Chargement des règles…" : undefined}
          columns={[
            { key: "label", label: "Rôle / Libellé", render: (row) => <strong>{row.label}</strong> },
            {
              key: "category",
              label: "Catégorie",
              render: (row) => <span className="text-soft">{pointCategoryLabel(row.category)}</span>,
            },
            {
              key: "points",
              label: "Points",
              render: (row) =>
                row.hasJ15J4 ? (
                  <span className="text-soft text-center w-[82px]">—</span>
                ) : (
                  renderPointsInput(row.points, (v) => updateLive(row.key, "points", v))
                ),
            },
            {
              key: "pointsJ15",
              label: "Points J-15",
              render: (row) =>
                row.hasJ15J4 ? (
                  renderPointsInput(row.pointsJ15, (v) => updateLive(row.key, "pointsJ15", v))
                ) : (
                  <span className="text-soft text-center w-[82px]">—</span>
                ),
            },
            {
              key: "pointsJ4",
              label: "Points J-4",
              render: (row) =>
                row.hasJ15J4 ? (
                  renderPointsInput(row.pointsJ4, (v) => updateLive(row.key, "pointsJ4", v))
                ) : (
                  <span className="text-soft text-center w-[82px]">—</span>
                ),
            },
            {
              key: "actions",
              label: "",
              render: (row) => (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground"
                  aria-label={`Détails de la règle ${row.label}`}
                  title={row.key}
                >
                  <Info size={15} />
                </Button>
              ),
            },
          ]}
        />

      <div className="mt-4 flex flex-wrap items-center justify-end gap-4">
        <span className="text-[11px] text-soft">
          {dirty
            ? "Modifications non enregistrées"
            : "Règles à jour"}
        </span>
        <Button onClick={save} disabled={saving || !dirty}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Enregistrement…" : "Enregistrer les règles"}
        </Button>
      </div>
    </>
  );
}