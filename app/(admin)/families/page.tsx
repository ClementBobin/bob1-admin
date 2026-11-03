"use client";

import { useEffect, useMemo, useState } from "react";
import { Home, MoreHorizontal, Plus, UsersRound } from "lucide-react";
import { families, type Family } from "@/lib/data";
import { familyToRow } from "@/lib/adapters";
import { api, errorMessage, USE_MOCK, type AdminFamilyDto } from "@/lib/api";
import { useApiData } from "@/lib/use-api-data";
import { useToast } from "@/components/toast";
import {
  DataTable,
  Drawer,
  DrawerFooter,
  Filters,
  FormField,
  PageHeader,
  SelectInput,
  Status,
  TextInput,
} from "@/components/ui";

type FamiliesResponse = { total: number; items: AdminFamilyDto[] };

type FamilyPayload = { row: Family; name: string };

function FamilyForm({
  family,
  live,
  onSave,
}: {
  family: Family | null;
  live: boolean;
  onSave: (payload: FamilyPayload) => void;
}) {
  const [name, setName] = useState(family?.name ?? "Nouvelle famille");
  const [parents, setParents] = useState(family?.parents ?? "");
  const [children, setChildren] = useState(family?.children ?? "");
  const [accounts, setAccounts] = useState(family?.accounts ?? "0 compte");
  const [status, setStatus] = useState(family?.status ?? "À compléter");

  return (
    <form
      id="family-form"
      onSubmit={(event) => {
        event.preventDefault();
        const childCount = children.split(",").filter((item) => item.trim()).length;
        onSave({
          name: name.trim(),
          row: {
            id: family?.id ?? `f${Date.now()}`,
            name: name.trim(),
            parents: parents || "À renseigner",
            children: children || "—",
            size: family?.size ?? `${1 + childCount} membres`,
            accounts,
            status,
          },
        });
      }}
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <FormField label="Nom de la famille" wide>
          <TextInput value={name} onChange={(event) => setName(event.target.value)} required />
        </FormField>

        {live ? (
          <p className="col-span-full rounded-xl bg-muted px-3.5 py-3 text-[11px] leading-relaxed text-soft">
            L&apos;API ne permet pour l&apos;instant que de créer et renommer une famille. Rattachez les parents
            depuis la page Personnes, et les enfants depuis l&apos;application mobile.
          </p>
        ) : (
          <>
            <FormField label="Parents" wide hint="Séparez plusieurs parents par une virgule.">
              <TextInput value={parents} onChange={(event) => setParents(event.target.value)} placeholder="Camille & Julien" />
            </FormField>
            <FormField label="Enfants" wide hint="Séparez les prénoms par une virgule.">
              <TextInput value={children} onChange={(event) => setChildren(event.target.value)} placeholder="Léo, Chloé" />
            </FormField>
            <FormField label="Comptes">
              <SelectInput value={accounts} onChange={(event) => setAccounts(event.target.value)} options={["0 compte", "1 compte", "1 sans compte", "2 comptes", "2 sans compte", "3 comptes"]} />
            </FormField>
            <FormField label="Statut">
              <SelectInput value={status} onChange={(event) => setStatus(event.target.value)} options={["Complet", "À compléter"]} />
            </FormField>
          </>
        )}
      </div>

      {!live && (
        <div className="flex items-start gap-3 rounded-xl bg-muted px-3.5 py-3 text-[11px] leading-relaxed text-soft">
          <UsersRound size={16} className="mt-0.5 shrink-0" />
          <span>
            Chaque enfant peut être rattaché à ses activités et à ses engagements. Les parents sans compte peuvent
            être invités depuis la fiche famille.
          </span>
        </div>
      )}
    </form>
  );
}

export default function FamiliesPage() {
  const [rows, setRows] = useState<Family[]>(USE_MOCK ? families : []);
  const [search, setSearch] = useState("");
  const [accounts, setAccounts] = useState("Tous les comptes");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Family | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const { data: apiFamilies, loading, error, reload } = useApiData<FamiliesResponse>(
    () => api.families.list({ take: 300 }),
    { total: 0, items: [] }
  );

  useEffect(() => {
    if (USE_MOCK) return;
    setRows(apiFamilies.items.map(familyToRow));
  }, [apiFamilies]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchSearch = `${row.name} ${row.parents} ${row.children}`.toLowerCase().includes(needle);
      const matchAccounts =
        accounts === "Tous les comptes" ||
        (accounts === "Complet" ? row.status === "Complet" : row.status === "À compléter");
      return matchSearch && matchAccounts;
    });
  }, [rows, search, accounts]);

  const openCreate = () => {
    setEditing(null);
    setDrawerOpen(true);
  };

  const openEdit = (row: Family) => {
    setEditing(row);
    setDrawerOpen(true);
  };

  const save = async (payload: FamilyPayload) => {
    if (USE_MOCK) {
      if (editing) {
        setRows((current) => current.map((item) => (item.id === payload.row.id ? payload.row : item)));
        toast("La famille a été mise à jour.");
      } else {
        setRows((current) => [payload.row, ...current]);
        toast("La famille a été créée.");
      }
      setDrawerOpen(false);
      setEditing(null);
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await api.families.update(editing.id, payload.name);
        toast("La famille a été mise à jour.");
      } else {
        await api.families.create(payload.name);
        toast("La famille a été créée.");
      }
      await reload();
      setDrawerOpen(false);
      setEditing(null);
    } catch (cause) {
      toast(errorMessage(cause), "danger");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        id="tour-families-header"
        eyebrow="Membres"
        title="Familles"
        description="Gérez les foyers, parents et enfants associés."
        action={{ label: "Créer une famille", icon: Plus, onClick: openCreate }}
      />

      <Filters
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Rechercher une famille, un enfant…"
        selects={[
          {
            label: "Comptes",
            value: accounts,
            options: ["Tous les comptes", "Complet", "À compléter"],
            onChange: setAccounts,
          },
        ]}
        onReset={() => {
          setSearch("");
          setAccounts("Tous les comptes");
        }}
      />

      {!USE_MOCK && error && (
        <div className="mb-4 rounded-xl bg-danger-soft px-4 py-3 text-[12px] font-medium text-danger">{error}</div>
      )}

      <DataTable
        id="tour-families-table"
        rows={filtered}
        rowKey={(row) => row.id}
        minWidth={900}
        grid="1.2fr 1.25fr 1.3fr .8fr 1fr 36px"
        emptyMessage={loading ? "Chargement des familles…" : undefined}
        columns={[
          {
            key: "family",
            label: "Famille",
            render: (row) => (
              <span className="flex items-center gap-2.5">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-soft">
                  <Home size={15} />
                </span>
                <strong className="truncate">{row.name}</strong>
              </span>
            ),
          },
          { key: "parents", label: "Parents", render: (row) => <span className="truncate">{row.parents}</span> },
          { key: "children", label: "Enfants", render: (row) => <span className="truncate text-soft">{row.children}</span> },
          { key: "size", label: "Taille", render: (row) => row.size },
          {
            key: "accounts",
            label: "Comptes",
            render: (row) => <Status tone={row.status === "Complet" ? "success" : "warning"}>{row.accounts}</Status>,
          },
          {
            key: "actions",
            label: "",
            render: (row) => (
              <button onClick={() => openEdit(row)} aria-label="Modifier" className="grid size-8 place-items-center rounded-lg text-soft transition hover:bg-muted">
                <MoreHorizontal size={16} />
              </button>
            ),
          },
        ]}
      />

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editing ? "Modifier la famille" : "Créer une famille"}
        subtitle="Foyer et membres associés"
        footer={
          <DrawerFooter
            onCancel={() => setDrawerOpen(false)}
            submitLabel={saving ? "Enregistrement…" : editing ? "Enregistrer" : "Créer la famille"}
            form="family-form"
          />
        }
      >
        {drawerOpen && (
          <FamilyForm key={editing?.id ?? "new"} family={editing} live={!USE_MOCK} onSave={save} />
        )}
      </Drawer>
    </>
  );
}
