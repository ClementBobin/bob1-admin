"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { api } from "@/lib/api";
import { useApiData } from "@/hooks/use-api-data";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/data-table";
import { Filters } from "@/components/shared/filters";
import { PageHeader } from "@/components/layout/page-header";
import { Status } from "@/components/shared/status";
import { formatDateTime } from "@/lib/utils";
import { ErrorBanner } from "@/components/shared/error-banner";
import type { NotificationDto } from "@/types";

function notificationType(row: NotificationDto) {
  if (!row.dataJson) return "broadcast";
  try {
    return JSON.parse(row.dataJson).type ?? "broadcast";
  } catch {
    return "broadcast";
  }
}

export default function NotificationsListPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("Tous les types");
  const [statusFilter, setStatusFilter] = useState("Tous les statuts");
  // No delete for sent notifications

  const {
    data: rows,
    setData,
    loading,
    error,
    reload,
  } = useApiData<NotificationDto[]>(
    () => api.notifications.adminList({ take: 200 }).then((r) => r.items)
  );

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return (rows ?? []).filter((row) => {
      const matchSearch = `${row.title} ${row.body}`.toLowerCase().includes(needle);
      const matchType = typeFilter === "Tous les types" || notificationType(row) === typeFilter;
      const matchStatus = statusFilter === "Tous les statuts" || (statusFilter === "Lue" ? row.isRead : !row.isRead);
      return matchSearch && matchType && matchStatus;
    });
  }, [rows, search, typeFilter, statusFilter]);

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
            options: ["Tous les types", "Général", "Match", "Urgent", "Pénalité"],
            onChange: setTypeFilter,
          },
          {
            label: "Statut",
            value: statusFilter,
            options: ["Tous les statuts", "Lue", "Non lue"],
            onChange: setStatusFilter,
          },
        ]}
        onReset={() => {
          setSearch("");
          setTypeFilter("Tous les types");
          setStatusFilter("Tous les statuts");
        }}
      />

      <ErrorBanner message={error} />

      <DataTable
        id="tour-notifications-table"
        rows={filtered}
        rowKey={(row) => row.id}
        minWidth={900}
        emptyMessage={loading ? "Chargement des notifications…" : undefined}
        columns={[
          { key: "title", label: "Titre", render: (row) => <strong className="truncate">{row.title}</strong> },
          {
            key: "body",
            label: "Message",
            render: (row) => <span className="line-clamp-2 max-w-[360px] text-muted-foreground">{row.body}</span>,
          },
          {
            key: "type",
            label: "Type",
            render: (row) => <Badge variant="outline">{notificationType(row)}</Badge>,
          },
          {
            key: "createdAt",
            label: "Date",
            render: (row) => <span className="text-muted-foreground">{formatDateTime(row.createdAtUtc)}</span>,
          },
          {
            key: "status",
            label: "Statut",
            render: (row) => (
              <Status tone={row.isRead ? "success" : "warning"}>{row.isRead ? "Lue" : "Non lue"}</Status>
            ),
          },
        ]}
      />
    </>
  );
}
