"use client";

import { useMemo, useState } from "react";
import { MoreHorizontal, Plus, TrendingUp } from "lucide-react";
import { families, people, rankings, type RankingRow } from "@/lib/data";
import { rankingToRow } from "@/lib/adapters";
import {
  api,
  errorMessage,
  USE_MOCK,
  type AdminFamilyDto,
} from "@/lib/api";
import { useApiData } from "@/lib/use-api-data";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/toast";
import {
  Avatar,
  DataTable,
  Drawer,
  DrawerFooter,
  FormField,
  PageHeader,
  SelectInput,
  TextInput,
} from "@/components/ui";

type Tab = "Officiels" | "Covoiturage" | "Buvette";

type RankingsData = { rows: RankingRow[]; season: string };
type FamiliesResponse = { total: number; items: AdminFamilyDto[] };
type FamilyOption = { id: string; name: string };

type AdjustPayload = {
  familyId: string | null;
  target: string;
  points: number;
  reason: string;
};

const TAB_CATEGORY: Record<Tab, string> = {
  Officiels: "staff",
  Covoiturage: "carpool",
  Buvette: "volunteer",
};

function AdjustForm({
  tab,
  live,
  familyOptions,
  personOptions,
  onSave,
}: {
  tab: Tab;
  live: boolean;
  familyOptions: FamilyOption[];
  personOptions: string[];
  onSave: (payload: AdjustPayload) => void;
}) {
  const [target, setTarget] = useState(live ? familyOptions[0]?.name ?? "" : personOptions[0] ?? "");
  const [points, setPoints] = useState("5");
  const [motif, setMotif] = useState("Participation exceptionnelle");

  return (
    <form
      id="points-form"
      onSubmit={(event) => {
        event.preventDefault();
        const parsed = Number(points.replace(",", ".").replace(/[^\d.+-]/g, ""));
        const familyId = live
          ? familyOptions.find((item) => item.name === target)?.id ?? null
          : null;
        onSave({ familyId, target, points: parsed, reason: motif });
      }}
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-1 gap-3.5">
        <FormField label={live ? "Famille" : "Personne"}>
          {live ? (
            <SelectInput
              value={target}
              onChange={(event) => setTarget(event.target.value)}
              options={familyOptions.map((item) => item.name)}
            />
          ) : (
            <SelectInput value={target} onChange={(event) => setTarget(event.target.value)} options={personOptions} />
          )}
        </FormField>
        <FormField label="Catégorie">
          <TextInput value={tab} readOnly />
        </FormField>
        <FormField label="Points" hint={live ? "Un nombre négatif retire des points." : undefined}>
          <TextInput
            value={points}
            onChange={(event) => setPoints(event.target.value)}
            inputMode={live ? "numeric" : "text"}
            type={live ? "number" : "text"}
          />
        </FormField>
        <FormField label="Motif">
          <TextInput value={motif} onChange={(event) => setMotif(event.target.value)} />
        </FormField>
      </div>

      <div className="rounded-xl bg-brand-soft px-3.5 py-3 text-[11px] leading-relaxed text-[#8e4200] dark:text-[#ffc48f]">
        {live
          ? "L'ajustement crée une entrée de pénalité dans le classement de la famille et lui envoie une notification."
          : "L'ajustement manuel est tracé dans l'historique et s'applique immédiatement au classement."}
      </div>
    </form>
  );
}

export default function RankingsPage() {
  const [tab, setTab] = useState<Tab>("Officiels");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const category = TAB_CATEGORY[tab];

  const fallback = useMemo<RankingsData>(
    () => ({ rows: rankings[tab] ?? [], season: "2024–2025" }),
    [tab]
  );

  const { data, loading, error, reload } = useApiData<RankingsData>(
    () =>
      api.rankings
        .get(category)
        .then((response) => ({ rows: response.top.map(rankingToRow), season: response.season })),
    fallback,
    [category, tab]
  );

  const { data: apiFamilies } = useApiData<FamiliesResponse>(
    () => api.families.list({ take: 300 }),
    { total: 0, items: [] }
  );

  const familyOptions: FamilyOption[] = USE_MOCK
    ? families.map((family) => ({ id: family.id, name: family.name }))
    : apiFamilies.items.map((family) => ({ id: family.id, name: family.name }));

  const personOptions = people.map((person) => person.name);
  const rows = data.rows;

  const save = async (payload: AdjustPayload) => {
    if (!Number.isFinite(payload.points) || payload.points === 0) {
      toast("Saisissez un nombre de points non nul.", "danger");
      return;
    }

    if (USE_MOCK) {
      toast(
        `L'ajustement de ${payload.points > 0 ? "+" : ""}${payload.points} points a été appliqué à ${payload.target}.`
      );
      setDrawerOpen(false);
      return;
    }

    if (!payload.familyId) {
      toast("Sélectionnez une famille.", "danger");
      return;
    }

    setSaving(true);
    try {
      await api.rankings.createPenalty({
        familyId: payload.familyId,
        points: payload.points,
        reason: payload.reason,
      });
      await reload();
      toast("L'ajustement de points a été appliqué.");
      setDrawerOpen(false);
    } catch (cause) {
      toast(errorMessage(cause), "danger");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        id="tour-rankings-header"
        eyebrow={`Saison ${data.season}`}
        title="Classements"
        description="Suivez et ajustez les points des membres."
        action={{ label: "Ajuster des points", icon: Plus, onClick: () => setDrawerOpen(true) }}
      />

      <div id="tour-rankings-tabs" className="mb-4 flex h-12 items-center gap-6 border-b border-line">
        {(["Officiels", "Covoiturage", "Buvette"] as Tab[]).map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={cn(
              "relative h-full text-[12.5px] font-bold transition",
              tab === item ? "text-brand" : "text-soft hover:text-ink"
            )}
          >
            {item}
            {tab === item && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-brand" />}
          </button>
        ))}
      </div>

      {!USE_MOCK && error && (
        <div className="mb-4 rounded-xl bg-danger-soft px-4 py-3 text-[12px] font-medium text-danger">{error}</div>
      )}

      <DataTable
        id="tour-rankings-table"
        rows={rows}
        rowKey={(row) => `${row.rank}-${row.member}`}
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
            key: "member",
            label: "Membre / famille",
            render: (row) => (
              <span className="flex items-center gap-2.5">
                <Avatar name={row.member} tone={row.highlight ? "orange" : "green"} size="sm" />
                <strong className="truncate">{row.member}</strong>
              </span>
            ),
          },
          {
            key: "participations",
            label: "Participations",
            render: (row) => (USE_MOCK ? row.participations : <span className="text-soft">—</span>),
          },
          {
            key: "bonus",
            label: "Bonus",
            render: (row) =>
              USE_MOCK ? <span className="text-green">+{row.bonus}</span> : <span className="text-soft">—</span>,
          },
          {
            key: "penalties",
            label: "Pénalités",
            render: (row) =>
              USE_MOCK ? (
                <span className={row.penalties < 0 ? "font-bold text-danger" : "text-soft"}>{row.penalties}</span>
              ) : (
                <span className="text-soft">—</span>
              ),
          },
          { key: "total", label: "Total", render: (row) => <span className="font-extrabold">{row.total} pts</span> },
          {
            key: "actions",
            label: "",
            render: () => (
              <button
                onClick={() => setDrawerOpen(true)}
                aria-label="Ajuster les points"
                className="grid size-8 place-items-center rounded-lg text-soft transition hover:bg-muted"
              >
                <MoreHorizontal size={16} />
              </button>
            ),
          },
        ]}
      />

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Ajuster des points"
        subtitle="Correction manuelle"
        footer={
          <DrawerFooter
            onCancel={() => setDrawerOpen(false)}
            submitLabel={saving ? "Application…" : "Appliquer l'ajustement"}
            form="points-form"
          />
        }
      >
        {drawerOpen && (
          <AdjustForm
            key={tab}
            tab={tab}
            live={!USE_MOCK}
            familyOptions={familyOptions}
            personOptions={personOptions}
            onSave={save}
          />
        )}
      </Drawer>
    </>
  );
}
