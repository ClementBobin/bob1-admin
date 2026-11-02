"use client";

import { useMemo, useState } from "react";
import { MapPin, MoreHorizontal, Plus } from "lucide-react";
import { venues } from "@/lib/data";
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

type VenueRow = {
  id: string;
  name: string;
  address: string;
  city: string;
  matches: string;
  status: string;
};

const initial: VenueRow[] = venues.map((item) => ({ ...item }));

function Form({ row, onSave }: { row: VenueRow | null; onSave: (row: VenueRow) => void }) {
  const [name, setName] = useState(row?.name ?? "Nouveau gymnase");
  const [address, setAddress] = useState(row?.address ?? "12 rue des Sports");
  const [city, setCity] = useState(row?.city ?? "Montpellier");
  const [postal, setPostal] = useState("34000");
  const [status, setStatus] = useState(row?.status ?? "Actif");

  return (
    <form
      id="venue-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSave({
          id: row?.id ?? `v${Date.now()}`,
          name,
          address,
          city,
          matches: row?.matches ?? "—",
          status,
        });
      }}
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <FormField label="Nom du lieu" wide>
          <TextInput value={name} onChange={(event) => setName(event.target.value)} required />
        </FormField>
        <FormField label="Adresse" wide>
          <TextInput value={address} onChange={(event) => setAddress(event.target.value)} required />
        </FormField>
        <FormField label="Ville">
          <TextInput value={city} onChange={(event) => setCity(event.target.value)} required />
        </FormField>
        <FormField label="Code postal">
          <TextInput value={postal} onChange={(event) => setPostal(event.target.value)} inputMode="numeric" />
        </FormField>
        <FormField label="Statut" wide>
          <SelectInput value={status} onChange={(event) => setStatus(event.target.value)} options={["Actif", "Externe", "Fermé"]} />
        </FormField>
      </div>

      <div>
        <span className="mb-1.5 block text-[11px] font-bold text-soft">Aperçu de la position</span>
        <div className="flex h-[142px] flex-col items-center justify-center gap-2 rounded-[13px] bg-[linear-gradient(135deg,var(--muted),color-mix(in_srgb,var(--mint)_60%,var(--muted)))] text-[11px] font-semibold text-mint-foreground">
          <MapPin size={26} />
          <span>
            {address}, {postal} {city}
          </span>
          <small className="text-[10px] font-medium opacity-70">Aperçu cartographique de démonstration</small>
        </div>
      </div>
    </form>
  );
}

export default function VenuesPage() {
  const [rows, setRows] = useState<VenueRow[]>(initial);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Tous les statuts");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<VenueRow | null>(null);
  const { toast } = useToast();

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchSearch = `${row.name} ${row.address} ${row.city}`.toLowerCase().includes(needle);
      const matchStatus = status === "Tous les statuts" || row.status === status;
      return matchSearch && matchStatus;
    });
  }, [rows, search, status]);

  const openCreate = () => {
    setEditing(null);
    setDrawerOpen(true);
  };

  const openEdit = (row: VenueRow) => {
    setEditing(row);
    setDrawerOpen(true);
  };

  const save = (row: VenueRow) => {
    if (editing) {
      setRows((current) => current.map((item) => (item.id === row.id ? row : item)));
      toast("Le lieu a été mis à jour.");
    } else {
      setRows((current) => [row, ...current]);
      toast("Le lieu a été ajouté.");
    }
    setDrawerOpen(false);
    setEditing(null);
  };

  return (
    <>
      <PageHeader
        id="tour-venues-header"
        eyebrow="Référentiels"
        title="Lieux"
        description="Centralisez les gymnases et adresses."
        action={{ label: "Ajouter un lieu", icon: Plus, onClick: openCreate }}
      />

      <Filters
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Rechercher un gymnase, une ville…"
        selects={[
          {
            label: "Statut",
            value: status,
            options: ["Tous les statuts", "Actif", "Externe", "Fermé"],
            onChange: setStatus,
          },
        ]}
        onReset={() => {
          setSearch("");
          setStatus("Tous les statuts");
        }}
      />

      <DataTable
        id="tour-venues-table"
        rows={filtered}
        rowKey={(row) => row.id}
        minWidth={820}
        grid="1.3fr 1.3fr 1fr .9fr .8fr 36px"
        columns={[
          {
            key: "name",
            label: "Nom",
            render: (row) => (
              <span className="flex items-center gap-2.5">
                <MapPin size={16} className="shrink-0 text-soft" />
                <strong className="truncate">{row.name}</strong>
              </span>
            ),
          },
          { key: "address", label: "Adresse", render: (row) => row.address },
          { key: "city", label: "Ville", render: (row) => row.city },
          { key: "matches", label: "Matchs à venir", render: (row) => row.matches },
          {
            key: "status",
            label: "Statut",
            render: (row) => (
              <Status tone={row.status === "Actif" ? "success" : row.status === "Externe" ? "info" : "neutral"}>
                {row.status}
              </Status>
            ),
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
        title={editing ? "Modifier le lieu" : "Ajouter un lieu"}
        subtitle="Adresse et géolocalisation"
        footer={
          <DrawerFooter
            onCancel={() => setDrawerOpen(false)}
            submitLabel={editing ? "Enregistrer" : "Ajouter le lieu"}
            form="venue-form"
          />
        }
      >
        {drawerOpen && <Form key={editing?.id ?? "new"} row={editing} onSave={save} />}
      </Drawer>
    </>
  );
}
