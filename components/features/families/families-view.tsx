"use client";

import { useEffect, useMemo, useState } from "react";
import { Home } from "lucide-react";
import { familyToRow } from "@/lib/adapters";
import { api } from "@/lib/api";
import { ACCOUNTS_OPTIONS, FILTER_ALL } from "@/lib/constants";
import { matchesSearch } from "@/lib/utils";
import { useApiData } from "@/hooks/use-api-data";
import { Status } from "@/components/shared/status";
import { DataTable } from "@/components/shared/data-table";
import { Filters } from "@/components/shared/filters";
import { PageHeader } from "@/components/layout/page-header";
import { ErrorBanner } from "@/components/shared/error-banner";
import type { AdminFamilyDto, Family } from "@/types";

export function FamiliesView() {
  const [rows, setRows] = useState<Family[]>([]);
  const [search, setSearch] = useState("");
  const [accountsFilter, setAccountsFilter] = useState(FILTER_ALL.accounts);
  const [hideInactive, setHideInactive] = useState(true); // Default: hide families with all inactive accounts

  const {
    data: apiFamilies,
    loading,
    error,
  } = useApiData<AdminFamilyDto[]>(
    () => api.families.list({ take: 300 }).then(({ items }) => items),
  );

  useEffect(() => {
    setRows(apiFamilies?.map(familyToRow) ?? []);
  }, [apiFamilies]);

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      const matchSearch = matchesSearch(search, row.name, row.parents, row.children);
      const matchAccounts =
        accountsFilter === FILTER_ALL.accounts ||
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
            options: [FILTER_ALL.accounts, ...ACCOUNTS_OPTIONS],
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
          setAccountsFilter(FILTER_ALL.accounts);
          setHideInactive(true);
        }}
      />

      <ErrorBanner message={error} />

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
