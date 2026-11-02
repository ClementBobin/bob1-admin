"use client";

import { useState } from "react";
import { Info, Save, ShieldCheck } from "lucide-react";
import { rules as initialRules, type RuleRow } from "@/lib/data";
import { useToast } from "@/components/toast";
import { Button, DataTable, PageHeader, Status } from "@/components/ui";

export default function RulesPage() {
  const [rows, setRows] = useState<RuleRow[]>(initialRules);
  const [dirty, setDirty] = useState(false);
  const { toast } = useToast();

  const update = (index: number, key: "j15" | "j4", value: string) => {
    const parsed = Math.max(0, Math.min(20, Number(value) || 0));
    setRows((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: parsed } : row)));
    setDirty(true);
  };

  return (
    <>
      <PageHeader
        id="tour-rules-header"
        eyebrow="Paramètres"
        title="Règles de points"
        description="Définissez les récompenses selon le rôle et le délai de confirmation."
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

      <DataTable
        id="tour-rules-table"
        rows={rows}
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
                  onChange={(event) => update(index, "j15", event.target.value)}
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
                  onChange={(event) => update(index, "j4", event.target.value)}
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

      <div className="mt-4 flex flex-wrap items-center justify-end gap-4">
        <span className="text-[11px] text-soft">
          {dirty ? "Modifications non enregistrées" : "Dernière modification aujourd'hui à 9:32"}
        </span>
        <Button
          icon={Save}
          onClick={() => {
            setDirty(false);
            toast("Les règles de points ont été enregistrées.");
          }}
        >
          Enregistrer les règles
        </Button>
      </div>
    </>
  );
}
