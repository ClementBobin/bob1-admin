"use client";

import { useEffect, useMemo, useState } from "react";
import { Home, MoreHorizontal, Filter, UsersRound, Eye, EyeOff } from "lucide-react";
import { families, type Family } from "@/lib/data";
import { familyToRow } from "@/lib/adapters";
import { api, errorMessage, USE_MOCK, type AdminFamilyDto } from "@/lib/api";
import { useApiData } from "@/lib/use-api-data";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { OptionSelect } from "@/components/option-select";
import { Status } from "@/components/status";
import { DataTable } from "@/components/data-table";
import { Filters } from "@/components/filters";
import { PageHeader } from "@/components/page-header";
import { FormSheet, FormSheetFooter } from "@/components/form-sheet";

type FamiliesResponse = { total: number; items: AdminFamilyDto[] };

export default function FamiliesPage() {
  const [rows, setRows] = useState<Family[]>(USE_MOCK ? families : []);
  const [search, setSearch] = useState("");
  const [accountsFilter, setAccountsFilter] = useState("Tous les comptes");
  const [hideInactive, setHideInactive] = useState(true); // Default: hide families with all inactive accounts
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Family | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    data: apiFamilies,
    loading,
    error,
    reload,
  } = useApiData<FamiliesResponse>(() => api.families.list({ take: 300 }), { total: 0, items: [] });

  useEffect(() => {
    if (USE_MOCK) return;
    setRows(apiFamilies.items.map(familyToRow));
  }, [apiFamilies]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchSearch = `${row.name} ${row.parents} ${row.children}`.toLowerCase().includes(needle);
      const matchAccounts =
        accountsFilter === "Tous les comptes" ||
        (accountsFilter === "Complet" ? row.status === "Complet" : row.status === "À compléter");
      const matchInactive = !hideInactive || !row.hasInactiveAccounts;
      return matchSearch && matchAccounts && matchInactive;
    });
  }, [rows, search, accountsFilter, hideInactive]);

  return (
    <>
      <PageHeader
        id="tour-families-header"
        eyebrow="Membres"
        title="Familles"
        description="Consultez les foyers, parents et enfants associés (lecture seule)."
      />

      <Filters
        id="tour-families-filters"
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Rechercher une famille, un enfant…"
        selects={[
          {
            label: "Comptes",
            value: accountsFilter,
            options: ["Tous les comptes", "Complet", "À compléter"],
            onChange: setAccountsFilter,
          },
          {
            label: "Inactifs",
            value: hideInactive ? "Masquer" : "Afficher",
            options: ["Masquer", "Afficher"],
            onChange: (value) => setHideInactive(value === "Masquer"),
          },
        ]}
        onReset={() => {
          setSearch("");
          setAccountsFilter("Tous les comptes");
          setHideInactive(true);
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
        grid="1.2fr 1.25fr 1.3fr .8fr 1fr 1fr 36px"
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
                {row.hasInactiveAccounts && (
                  <span
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-danger/10 text-danger text-[9px] font-bold"
                    title="Cette famille a des comptes inactifs"
                  >
                    !
                  </span>
                )}
              </span>
            ),
          },
          { key: "parents", label: "Parents", render: (row) => <span className="truncate">{row.parents}</span> },
          {
            key: "children",
            label: "Enfants",
            render: (row) => <span className="truncate text-soft">{row.children}</span>,
          },
          { key: "size", label: "Taille", render: (row) => row.size },
          {
            key: "accounts",
            label: "Comptes",
            render: (row) => <Status tone={row.status === "Complet" ? "success" : "warning"}>{row.accounts}</Status>,
          },
          {
            key: "inactiveStatus",
            label: "Comptes inactifs",
            render: (row) => (
              <Status tone={row.hasInactiveAccounts ? "warning" : "success"}>
                {row.hasInactiveAccounts ? "Oui" : "Non"}
              </Status>
            ),
          },
        ]}
      />
    </>
  );
}
