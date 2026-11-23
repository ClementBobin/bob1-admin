"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { api } from "@/lib/api";
import { usePagedQuery } from "@/hooks/use-paged-query";
import { useLookups } from "@/hooks/use-lookups";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/data-table";
import { Filters } from "@/components/shared/filters";
import { PageHeader } from "@/components/layout/page-header";
import { Status } from "@/components/shared/status";
import { FILTER_ALL } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import { ErrorBanner } from "@/components/shared/error-banner";
export function NotificationsListView() {
  const { notificationTypeNames } = useLookups();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState(FILTER_ALL.types);
  // No delete for sent notifications

  const query = usePagedQuery((params) => api.notifications.adminList(params), {
    search,
    type: typeFilter === FILTER_ALL.types ? undefined : typeFilter,
  });
  const { items: rows, loading, error } = query;

  // Notifications cannot be deleted once sent

  return (
    <>
      <PageHeader
        id="tour-notifications-header"
        eyebrow="Communication"
        title="Historique des notifications"
        description="Consultez, modifiez et supprimez les notifications envoyées."
        action={{ label: "Nouvelle notification", icon: Plus, onClick: () => router.push("/notifications/create") }}
      />

      <Filters
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Rechercher une notification…"
        selects={[
          {
            label: "Type",
            value: typeFilter,
            options: [FILTER_ALL.types, ...notificationTypeNames],
            onChange: setTypeFilter,
          },
        ]}
        onReset={() => {
          setSearch("");
          setTypeFilter(FILTER_ALL.types);
        }}
      />

      <ErrorBanner message={error} />

      <DataTable
        id="tour-notifications-table"
        rows={rows}
        server={{ total: query.total, page: query.page, onPageChange: query.setPage }}
        pageSize={query.pageSize}
        rowKey={(row) => row.id}
        minWidth={900}
        emptyMessage={loading ? "Chargement des notifications…" : undefined}
        columns={[
          { key: "title", label: "Titre", render: (row) => <strong className="truncate">{row.title}</strong> },
          {
            key: "body",
            label: "Message",
            render: (row) => <span className="line-clamp-2 max-w-90 text-muted-foreground">{row.body}</span>,
          },
          {
            key: "type",
            label: "Type",
            render: (row) => <Badge variant="outline">{row.type}</Badge>,
          },
          {
            key: "createdAt",
            label: "Date",
            render: (row) => <span className="text-muted-foreground">{formatDateTime(row.createdAtUtc)}</span>,
          },
          {
            key: "reads",
            label: "Lecture",
            render: (row) => (
              <Status tone={row.recipientCount > 0 && row.readCount === row.recipientCount ? "success" : "warning"}>
                {row.readCount} / {row.recipientCount} lues
              </Status>
            ),
          },
        ]}
      />
    </>
  );
}
