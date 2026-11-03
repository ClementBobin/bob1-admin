"use client";

import { useEffect, useState } from "react";
import { Info, Save, ShieldCheck } from "lucide-react";
import { rules as initialRules, type RuleRow } from "@/lib/data";
import { ruleCategoryLabel } from "@/lib/adapters";
import { api, errorMessage, USE_MOCK, type RankingRuleDto } from "@/lib/api";
import { useApiData } from "@/lib/use-api-data";
import { useToast } from "@/components/toast";
import { Button, DataTable, PageHeader, Status } from "@/components/ui";

export default function RulesPage() {
  const [mockRows, setMockRows] = useState<RuleRow[]>(initialRules);
  const [liveRows, setLiveRows] = useState<RankingRuleDto[]>([]);
  const [dirty, setDirty] = useState(false);
  const [dirtyKeys, setDirtyKeys] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const { data: apiRules, loading, error, reload } = useApiData<RankingRuleDto[]>(
    () => api.rankings.rules(),
    []
  );

  useEffect(() => {
    if (USE_MOCK) return;
    setLiveRows(apiRules);
    setDirtyKeys({});
    setDirty(false);
  }, [apiRules]);

  const updateMock = (index: number, key: "j15" | "j4", value: string) => {
    const parsed = Math.max(0, Math.min(20, Number(value) || 0));
    setMockRows((current) =>
      current.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: parsed } : row))
    );
    setDirty(true);
  };

  const updateLive = (key: string, value: string) => {
    const parsed = Math.max(-1000, Math.min(1000, Math.round(Number(value) || 0)));
    setLiveRows((current) => current.map((row) => (row.key === key ? { ...row, points: parsed } : row)));
    setDirtyKeys((current) => ({ ...current, [key]: true }));
    setDirty(true);
  };

  const save = async () => {
    if (USE_MOCK) {
      setDirty(false);
      toast("Les règles de points ont été enregistrées.");
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
        await api.rankings.updateRule(row.key, row.points, row.label);
      }
      await reload();
      setDirtyKeys({});
      setDirty(false);
      toast("Les règles de points ont été enregistrées.");
    } catch (cause) {
      toast(errorMessage(cause), "danger");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        id="tour-rules-header"
        eyebrow="Paramètres"
        title="Règles de points"
        description={
          USE_MOCK
            ? "Définissez les récompenses selon le rôle et le délai de confirmation."
            : "Définissez les points attribués à chaque action du club."
        }
      />

      <div className="mb-4 flex items-start gap-3 rounded-xl bg-mint px-4 py-3.5 text-mint-foreground">
        <ShieldCheck size={18} className="mt-0.5 shrink-0" />
        <div className="flex flex-col">
          <strong className="text-[12px]">Les règles s&apos;appliquent aux nouvelles confirmations</strong>
          <small className="mt-0.5 text-[11px] opacity-80">
            Une modification n&apos;affecte pas les points déjà attribués.
          </small>
        </div>
      </div>

      {!USE_MOCK && error && (
        <div className="mb-4 rounded-xl bg-danger-soft px-4 py-3 text-[12px] font-medium text-danger">{error}</div>
      )}

      {!USE_MOCK && (
        <p className="mb-4 rounded-xl bg-muted px-4 py-3 text-[11px] leading-relaxed text-soft">
          L&apos;API enregistre une seule valeur de points par règle. Le détail J-15 / J-4 de la démonstration
          n&apos;est pas encore modélisé.
        </p>
      )}

      {USE_MOCK ? (
        <DataTable
          id="tour-rules-table"
          rows={mockRows}
          rowKey={(row) => row.role}
          minWidth={820}
          pageSize={10}
          grid="1fr 1.5fr 1fr 1fr .7fr 36px"
          columns={[
            { key: "role", label: "Rôle", render: (row) => <strong>{row.role}</strong> },
            { key: "description", label: "Description", render: (row) => <span className="text-soft">{row.description}</span> },
            {
              key: "j15",
              label: "Confirmation J-15",
              render: (row, index) => (
                <span className="flex h-8 w-[82px] items-center gap-1 rounded-lg border border-line bg-card pl-2.5 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15">
                  <span className="text-[11px] font-bold text-green">+</span>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={row.j15}
                    onChange={(event) => updateMock(index, "j15", event.target.value)}
                    aria-label={`Points J-15 pour ${row.role}`}
                    className="w-full bg-transparent text-[11px] font-bold text-green outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="pr-2 text-[9px] text-soft">pts</span>
                </span>
              ),
            },
            {
              key: "j4",
              label: "Confirmation J-4",
              render: (row, index) => (
                <span className="flex h-8 w-[82px] items-center gap-1 rounded-lg border border-line bg-card pl-2.5 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15">
                  <span className="text-[11px] font-bold text-green">+</span>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={row.j4}
                    onChange={(event) => updateMock(index, "j4", event.target.value)}
                    aria-label={`Points J-4 pour ${row.role}`}
                    className="w-full bg-transparent text-[11px] font-bold text-green outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="pr-2 text-[9px] text-soft">pts</span>
                </span>
              ),
            },
            { key: "status", label: "Statut", render: () => <Status tone="success">Active</Status> },
            {
              key: "actions",
              label: "",
              render: () => (
                <button aria-label="Détails de la règle" className="grid size-8 place-items-center rounded-lg text-soft transition hover:bg-muted">
                  <Info size={15} />
                </button>
              ),
            },
          ]}
        />
      ) : (
        <DataTable
          id="tour-rules-table"
          rows={liveRows}
          rowKey={(row) => row.key}
          minWidth={760}
          pageSize={10}
          grid="1.4fr 1.2fr 1fr .8fr 36px"
          emptyMessage={loading ? "Chargement des règles…" : undefined}
          columns={[
            { key: "label", label: "Rôle", render: (row) => <strong>{row.label}</strong> },
            {
              key: "category",
              label: "Description",
              render: (row) => <span className="text-soft">{ruleCategoryLabel(row.category)}</span>,
            },
            {
              key: "points",
              label: "Points",
              render: (row) => (
                <span className="flex h-8 w-[82px] items-center gap-1 rounded-lg border border-line bg-card pl-2.5 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15">
                  <input
                    type="number"
                    min={-1000}
                    max={1000}
                    value={row.points}
                    onChange={(event) => updateLive(row.key, event.target.value)}
                    aria-label={`Points pour ${row.label}`}
                    className="w-full bg-transparent text-[11px] font-bold text-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="pr-2 text-[9px] text-soft">pts</span>
                </span>
              ),
            },
            { key: "status", label: "Statut", render: () => <Status tone="success">Active</Status> },
            {
              key: "actions",
              label: "",
              render: (row) => (
                <button
                  aria-label={`Détails de la règle ${row.label}`}
                  title={row.key}
                  className="grid size-8 place-items-center rounded-lg text-soft transition hover:bg-muted"
                >
                  <Info size={15} />
                </button>
              ),
            },
          ]}
        />
      )}

      <div className="mt-4 flex flex-wrap items-center justify-end gap-4">
        <span className="text-[11px] text-soft">
          {dirty ? "Modifications non enregistrées" : USE_MOCK ? "Dernière modification aujourd'hui à 9:32" : "Règles à jour"}
        </span>
        <Button icon={Save} onClick={save} disabled={saving || !dirty}>
          {saving ? "Enregistrement…" : "Enregistrer les règles"}
        </Button>
      </div>
    </>
  );
}
