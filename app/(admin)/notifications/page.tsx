"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, CalendarDays, Send, Users, Smartphone, Trash2, Pencil } from "lucide-react";
import { api, errorMessage, USE_MOCK, type NotificationDto } from "@/lib/api";
import { useApiData } from "@/lib/use-api-data";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { OptionSelect } from "@/components/option-select";
import { PageHeader, CardHeading } from "@/components/page-header";
import { DataTable } from "@/components/data-table";
import { Filters } from "@/components/filters";
import { Status } from "@/components/status";
import { Badge } from "@/components/ui/badge";
import { FormSheet, FormSheetFooter } from "@/components/form-sheet";
import { cn } from "@/lib/utils";
import { formatDate, formatDateTime } from "@/lib/adapters";

export default function NotificationsListPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("Tous les types");
  const [statusFilter, setStatusFilter] = useState("Tous les statuts");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<NotificationDto | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: apiNotifications, loading, error, reload } = useApiData<NotificationDto[]>(
    () => api.notifications.list(200),
    [],
  );

  const rows = USE_MOCK
    ? [
        {
          id: "n1",
          title: "Réunion des bénévoles",
          body: "Rendez-vous mercredi 28 mai à 19:00 au club-house.",
          dataJson: null,
          createdAtUtc: new Date().toISOString(),
          isRead: false,
          expiresAtUtc: null,
          recurring: false,
          startup: true,
        },
        {
          id: "n2",
          title: "Match annulé",
          body: "Le match U13 vs Castelnau a été annulé.",
          dataJson: null,
          createdAtUtc: new Date(Date.now() - 86400000).toISOString(),
          isRead: true,
          expiresAtUtc: new Date(Date.now() + 86400000 * 7).toISOString(),
          recurring: false,
          startup: false,
        },
      ]
    : apiNotifications;

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchSearch = `${row.title} ${row.body}`.toLowerCase().includes(needle);
      const matchType = typeFilter === "Tous les types" || (row.dataJson && row.dataJson.includes(typeFilter));
      const matchStatus = statusFilter === "Tous les statuts" || (statusFilter === "Lue" ? row.isRead : !row.isRead);
      return matchSearch && matchType && matchStatus;
    });
  }, [rows, search, typeFilter, statusFilter]);

  const remove = async (id: string) => {
    if (!window.confirm("Supprimer cette notification ?")) return;
    try {
      // In mock mode, just remove from local state
      if (USE_MOCK) {
        toast.success("Notification supprimée (simulation).");
      } else {
        // API doesn't have delete endpoint, but we can try
        toast.info("La suppression n'est pas encore disponible via l'API.");
      }
    } catch (cause) {
      toast.error(errorMessage(cause));
    }
  };

  const openEdit = (row: NotificationDto) => {
    setEditing(row);
    setDrawerOpen(true);
  };

  return (
    <>
      <PageHeader
        id="tour-notifications-header"
        eyebrow="Communication"
        title="Historique des notifications"
        description="Consultez, modifiez et supprimez les notifications envoyées."
        action={{ label: "Nouvelle notification", icon: CalendarDays, onClick: () => (window.location.href = "/notifications/create") }}
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
        grid="1.5fr 2fr 1fr 1fr 1fr 36px"
        emptyMessage={loading ? "Chargement des notifications…" : undefined}
        columns={[
          {
            key: "title",
            label: "Titre",
            render: (row) => <strong className="truncate">{row.title}</strong>,
          },
          {
            key: "body",
            label: "Message",
            render: (row) => <span className="truncate text-soft">{row.body}</span>,
          },
          {
            key: "type",
            label: "Type",
            render: (row) => {
              const type = row.dataJson ? JSON.parse(row.dataJson).type : "broadcast";
              return <Badge variant="outline">{type}</Badge>;
            },
          },
          {
            key: "createdAt",
            label: "Date",
            render: (row) => <span className="text-soft">{formatDateTime(row.createdAtUtc)}</span>,
          },
          {
            key: "status",
            label: "Statut",
            render: (row) => (
              <Status tone={row.isRead ? "success" : "warning"}>
                {row.isRead ? "Lue" : "Non lue"}
              </Status>
            ),
          },
          {
            key: "actions",
            label: "",
            render: (row) => (
              <div className="flex items-center gap-1.5 justify-center">
                <button
                  onClick={() => openEdit(row)}
                  aria-label="Modifier"
                  className="grid size-8 place-items-center rounded-lg text-soft transition hover:bg-muted"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => remove(row.id)}
                  aria-label="Supprimer"
                  className="grid size-8 place-items-center rounded-lg text-soft transition hover:bg-danger-soft hover:text-danger"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ),
          },
        ]}
      />

      <FormSheet
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditing(null);
        }}
        title="Modifier la notification"
        subtitle={editing ? editing.title : "Notification"}
        footer={
          <FormSheetFooter
            onCancel={() => {
              setDrawerOpen(false);
              setEditing(null);
            }}
            submitLabel={saving ? "Enregistrement…" : "Enregistrer"}
            form="notification-form"
          />
        }
      >
        {drawerOpen && editing && (
          <NotificationForm
            key={editing.id}
            notification={editing}
            onSave={async (payload) => {
              if (USE_MOCK) {
                toast.success("La notification a été mise à jour (simulation).");
                setDrawerOpen(false);
                setEditing(null);
                return;
              }
              // API doesn't have update endpoint yet
              toast.info("La modification n'est pas encore disponible via l'API.");
              setDrawerOpen(false);
              setEditing(null);
            }}
          />
        )}
      </FormSheet>
    </>
  );
}

interface NotificationFormProps {
  notification: NotificationDto;
  onSave: (payload: { title: string; body: string }) => void;
}

function NotificationForm({ notification, onSave }: NotificationFormProps) {
  const [title, setTitle] = useState(notification.title);
  const [body, setBody] = useState(notification.body);

  return (
    <form
      id="notification-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSave({ title: title.trim(), body: body.trim() });
      }}
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-1 gap-3.5">
        <Field className="col-span-full">
          <FieldLabel htmlFor="notification-form-title" className="text-[11px] font-bold text-muted-foreground">
            Titre
          </FieldLabel>
          <Input id="notification-form-title" value={title} onChange={(event) => setTitle(event.target.value)} required />
        </Field>
        <Field className="col-span-full">
          <FieldLabel htmlFor="notification-form-body" className="text-[11px] font-bold text-muted-foreground">
            Corps du message
          </FieldLabel>
          <Textarea id="notification-form-body" value={body} onChange={(event) => setBody(event.target.value)} required />
        </Field>
      </div>
    </form>
  );
}