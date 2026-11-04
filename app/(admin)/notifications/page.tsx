"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api, errorMessage, USE_MOCK, type NotificationDto } from "@/lib/api";
import { mockNotifications } from "@/lib/data";
import { useApiData } from "@/lib/use-api-data";
import { formatDateTime } from "@/lib/adapters";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { Filters } from "@/components/filters";
import { PageHeader } from "@/components/page-header";
import { Status } from "@/components/status";

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
  const [toDelete, setToDelete] = useState<NotificationDto | null>(null);

  const {
    data: rows,
    setData,
    loading,
    error,
  } = useApiData<NotificationDto[]>(() => api.notifications.list(200), mockNotifications);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchSearch = `${row.title} ${row.body}`.toLowerCase().includes(needle);
      const matchType = typeFilter === "Tous les types" || notificationType(row) === typeFilter;
      const matchStatus = statusFilter === "Tous les statuts" || (statusFilter === "Lue" ? row.isRead : !row.isRead);
      return matchSearch && matchType && matchStatus;
    });
  }, [rows, search, typeFilter, statusFilter]);

  const confirmDelete = () => {
    if (!toDelete) return;
    try {
      if (USE_MOCK) {
        setData((current) => current.filter((row) => row.id !== toDelete.id));
        toast.success("Notification supprimée (simulation).");
      } else {
        // Bob1-api has no delete endpoint yet.
        toast.info("La suppression n'est pas encore disponible via l'API.");
      }
    } catch (cause) {
      toast.error(errorMessage(cause));
    } finally {
      setToDelete(null);
    }
  };

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

      {!USE_MOCK && error && (
        <div className="mb-4 rounded-xl bg-danger-soft px-4 py-3 text-[12px] font-medium text-danger">{error}</div>
      )}

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
          {
            key: "actions",
            label: "",
            render: (row) => (
              <div className="flex items-center justify-end gap-1">
                <Button variant="ghost" size="icon-sm" className="text-muted-foreground" asChild>
                  <Link href={`/notifications/${row.id}/edit`} aria-label={`Modifier ${row.title}`}>
                    <Pencil />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:bg-danger-soft hover:text-danger"
                  onClick={() => setToDelete(row)}
                  aria-label={`Supprimer ${row.title}`}
                >
                  <Trash2 />
                </Button>
              </div>
            ),
          },
        ]}
      />

      <AlertDialog open={toDelete !== null} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-danger-soft text-danger">
              <Trash2 />
            </AlertDialogMedia>
            <AlertDialogTitle>Supprimer cette notification ?</AlertDialogTitle>
            <AlertDialogDescription>
              « {toDelete?.title} » sera retirée de l'historique. Cette action est définitive.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
