"use client";

import { useEffect, useState } from "react";
import { Info, Save, ShieldCheck, AlertCircle } from "lucide-react";
import { rules as initialRules, type RuleRow } from "@/lib/data";
import { ruleCategoryLabel, ruleToRow } from "@/lib/adapters";
import { api, errorMessage, USE_MOCK, type RankingRuleDto } from "@/lib/api";
import { useApiData } from "@/lib/use-api-data";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Status } from "@/components/status";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";

export default function RulesPage() {
  const [mockRows, setMockRows] = useState<RuleRow[]>(initialRules);
  const [liveRows, setLiveRows] = useState<RankingRuleDto[]>([]);
  const [dirty, setDirty] = useState(false);
  const [dirtyKeys, setDirtyKeys] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  const { data: apiRules, loading, error, reload } = useApiData<RankingRuleDto[]>(() => api.rankings.rules(), []);

  useEffect(() => {
    if (USE_MOCK) return;
    setLiveRows(apiRules);
    setDirtyKeys({});
    setDirty(false);
  }, [apiRules]);

  const updateMock = (index: number, key: "points" | "pointsJ15" | "pointsJ4", value: string) => {
    const parsed = Math.max(-1000, Math.min(1000, Math.round(Number(value) || 0)));
    setMockRows((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: parsed } : row)));
    setDirty(true);
  };

  const updateLive = (key: string, field: "points" | "pointsJ15" | "pointsJ4", value: string) => {
    const parsed = Math.max(-1000, Math.min(1000, Math.round(Number(value) || 0)));
    setLiveRows((current) => current.map((row) => (row.key === key ? { ...row, [field]: parsed } : row)));
    setDirtyKeys((current) => ({ ...current, [key]: true }));
    setDirty(true);
  };

  const save = async () => {
    if (USE_MOCK) {
      setDirty(false);
      toast.success("Les règles de points ont été enregistrées.");
      return;
    }

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
          row.pointsJ15 ?? undefined,
          row.pointsJ4 ?? undefined,
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

  const renderPointsInput = (
    value: number | undefined,
    onChange: (value: string) => void,
    min = -1000,
    max = 1000,
    showPlus = true,
  ) => (
    <span className="flex h-8 w-[82px] items-center gap-1 rounded-lg border border-line bg-card pl-2.5 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15">
      {showPlus && <span className="text-[11px] font-bold text-green">+</span>}
      <input
        type="number"
        min={min}
        max={max}
        value={value ?? 0}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-transparent text-[11px] font-bold text-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
      />
      <span className="pr-2 text-[9px] text-soft">pts</span>
    </span>
  );

  return (
    <>
      <PageHeader
        id="tour-rules-header"
        eyebrow="Paramètres"
        title="Règles de points"
        description={
          USE_MOCK
            ? "Définissez les récompenses selon le rôle et le délai de confirmation (J-15 / J-4)."
            : "Définissez les points attribués à chaque action du club. Certaines règles supportent J-15 / J-4."
        }
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

      {!USE_MOCK && error && (
        <div className="mb-4 rounded-xl bg-danger-soft px-4 py-3 text-[12px] font-medium text-danger">{error}</div>
      )}

      {!USE_MOCK && (
        <p className="mb-4 rounded-xl bg-muted px-4 py-3 text-[11px] leading-relaxed text-soft">
          Les règles avec J-15/J-4 activé utilisent des valeurs distinctes pour les confirmations à J-15 et J-4. Les
          autres règles utilisent une valeur unique de points.
        </p>
      )}

      {USE_MOCK ? (
        <DataTable
          id="tour-rules-table"
          rows={mockRows}
          rowKey={(row) => row.key}
          minWidth={900}
          pageSize={10}
          grid="1fr 1.5fr 1fr 1fr 1fr .7fr 36px"
          columns={[
            {
              key: "key",
              label: "Clé",
              render: (row) => <code className="text-[11px] font-mono text-soft">{row.key}</code>,
            },
            { key: "label", label: "Rôle / Libellé", render: (row) => <strong>{row.label}</strong> },
            {
              key: "category",
              label: "Catégorie",
              render: (row) => <span className="text-soft">{ruleCategoryLabel(row.category)}</span>,
            },
            {
              key: "hasJ15J4",
              label: "J-15 / J-4",
              render: (row) =>
                row.hasJ15J4 ? <Status tone="success">Oui</Status> : <Status tone="neutral">Non</Status>,
            },
            {
              key: "points",
              label: "Points (standard)",
              render: (row, index) => renderPointsInput(row.points, (v) => updateMock(index, "points", v), -1000, 1000),
            },
            {
              key: "pointsJ15",
              label: "Points J-15",
              render: (row, index) =>
                row.hasJ15J4 ? (
                  renderPointsInput(row.pointsJ15, (v) => updateMock(index, "pointsJ15", v))
                ) : (
                  <span className="text-soft text-center w-[82px]">—</span>
                ),
            },
            {
              key: "pointsJ4",
              label: "Points J-4",
              render: (row, index) =>
                row.hasJ15J4 ? (
                  renderPointsInput(row.pointsJ4, (v) => updateMock(index, "pointsJ4", v))
                ) : (
                  <span className="text-soft text-center w-[82px]">—</span>
                ),
            },
            { key: "status", label: "Statut", render: () => <Status tone="success">Active</Status> },
            {
              key: "actions",
              label: "",
              render: () => (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground"
                  aria-label="Détails de la règle"
                >
                  <Info size={15} />
                </Button>
              ),
            },
          ]}
        />
      ) : (
        <DataTable
          id="tour-rules-table"
          rows={liveRows.map(ruleToRow)}
          rowKey={(row) => row.key}
          minWidth={900}
          pageSize={10}
          grid="1fr 1.2fr 1fr 1fr 1fr .7fr 36px"
          emptyMessage={loading ? "Chargement des règles…" : undefined}
          columns={[
            {
              key: "key",
              label: "Clé",
              render: (row) => <code className="text-[11px] font-mono text-soft">{row.key}</code>,
            },
            { key: "label", label: "Rôle / Libellé", render: (row) => <strong>{row.label}</strong> },
            {
              key: "category",
              label: "Catégorie",
              render: (row) => <span className="text-soft">{ruleCategoryLabel(row.category)}</span>,
            },
            {
              key: "hasJ15J4",
              label: "J-15 / J-4",
              render: (row) =>
                row.hasJ15J4 ? <Status tone="success">Oui</Status> : <Status tone="neutral">Non</Status>,
            },
            {
              key: "points",
              label: "Points (standard)",
              render: (row) => renderPointsInput(row.points, (v) => updateLive(row.key, "points", v), -1000, 1000),
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
            { key: "status", label: "Statut", render: () => <Status tone="success">Active</Status> },
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
      )}

      <div className="mt-4 flex flex-wrap items-center justify-end gap-4">
        <span className="text-[11px] text-soft">
          {dirty
            ? "Modifications non enregistrées"
            : USE_MOCK
              ? "Dernière modification aujourd'hui à 9:32"
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
