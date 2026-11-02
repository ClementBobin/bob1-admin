"use client";

import { useMemo, useState } from "react";
import { MoreHorizontal, Plus, TrendingUp } from "lucide-react";
import { people, rankings } from "@/lib/data";
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

function AdjustForm({ tab, onSave }: { tab: Tab; onSave: () => void }) {
  const [target, setTarget] = useState(people[0].name);
  const [points, setPoints] = useState("+ 5");
  const [motif, setMotif] = useState("Participation exceptionnelle");

  return (
    <form
      id="points-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSave();
      }}
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-1 gap-3.5">
        <FormField label="Personne">
          <SelectInput value={target} onChange={(event) => setTarget(event.target.value)} options={people.map((person) => person.name)} />
        </FormField>
        <FormField label="Catégorie">
          <TextInput value={tab} readOnly />
        </FormField>
        <FormField label="Points">
          <TextInput value={points} onChange={(event) => setPoints(event.target.value)} />
        </FormField>
        <FormField label="Motif">
          <TextInput value={motif} onChange={(event) => setMotif(event.target.value)} />
        </FormField>
      </div>

      <div className="rounded-xl bg-brand-soft px-3.5 py-3 text-[11px] leading-relaxed text-[#8e4200] dark:text-[#ffc48f]">
        L&apos;ajustement manuel est tracé dans l&apos;historique et s&apos;applique immédiatement au classement.
      </div>
    </form>
  );
}

export default function RankingsPage() {
  const [tab, setTab] = useState<Tab>("Officiels");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { toast } = useToast();
  const rows = rankings[tab];

  const save = () => {
    toast("L'ajustement de points a été appliqué.");
    setDrawerOpen(false);
  };

  return (
    <>
      <PageHeader
        id="tour-rankings-header"
        eyebrow="Saison 2024–2025"
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

      <DataTable
        id="tour-rankings-table"
        rows={rows}
        rowKey={(row) => row.member}
        minWidth={880}
        grid=".6fr 1.6fr 1fr 1fr 1fr 1fr 36px"
        rowClassName={(row) => (row.highlight ? "bg-mint/40 dark:bg-mint/10" : undefined)}
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
          { key: "participations", label: "Participations", render: (row) => row.participations },
          { key: "bonus", label: "Bonus", render: (row) => <span className="text-green">+{row.bonus}</span> },
          { key: "penalties", label: "Pénalités", render: (row) => <span className={row.penalties < 0 ? "font-bold text-danger" : "text-soft"}>{row.penalties}</span> },
          { key: "total", label: "Total", render: (row) => <span className="font-extrabold">{row.total} pts</span> },
          {
            key: "actions",
            label: "",
            render: () => (
              <button aria-label="Actions" className="grid size-8 place-items-center rounded-lg text-soft transition hover:bg-muted">
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
        footer={<DrawerFooter onCancel={() => setDrawerOpen(false)} submitLabel="Appliquer l'ajustement" form="points-form" />}
      >
        {drawerOpen && <AdjustForm tab={tab} onSave={save} />}
      </Drawer>
    </>
  );
}
