"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin, MoreHorizontal, Plus } from "lucide-react";
import { api, errorMessage } from "@/lib/api";
import { useApiData } from "@/lib/use-api-data";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { DataTable } from "@/components/data-table";
import { Filters } from "@/components/filters";
import { PageHeader } from "@/components/page-header";
import { FormSheet, FormSheetFooter } from "@/components/form-sheet";
import type { VenueDto } from "@/types";

type VenueRow = {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  matches: string;
};

function Form({ row, onSave }: { row: VenueRow | null; onSave: (row: VenueRow) => void }) {
  const [name, setName] = useState(row?.name ?? "Nouveau gymnase");
  const [address, setAddress] = useState(row?.address ?? "12 rue des Sports");
  const [city, setCity] = useState(row?.city ?? "Montpellier");
  const [postalCode, setPostalCode] = useState(row?.postalCode ?? "34000");

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
          postalCode,
          matches: row?.matches ?? "—",
        });
      }}
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <Field className="col-span-full">
          <FieldLabel htmlFor="venues-field-32" className="text-[11px] font-bold text-muted-foreground">
            Nom du lieu
          </FieldLabel>
          <Input id="venues-field-32" value={name} onChange={(event) => setName(event.target.value)} required />
        </Field>
        <Field className="col-span-full">
          <FieldLabel htmlFor="venues-field-33" className="text-[11px] font-bold text-muted-foreground">
            Adresse
          </FieldLabel>
          <Input id="venues-field-33" value={address} onChange={(event) => setAddress(event.target.value)} required />
        </Field>
        <Field>
          <FieldLabel htmlFor="venues-field-34" className="text-[11px] font-bold text-muted-foreground">
            Ville
          </FieldLabel>
          <Input id="venues-field-34" value={city} onChange={(event) => setCity(event.target.value)} required />
        </Field>
        <Field>
          <FieldLabel htmlFor="venues-field-35" className="text-[11px] font-bold text-muted-foreground">
            Code postal
          </FieldLabel>
          <Input
            id="venues-field-35"
            value={postalCode}
            onChange={(event) => setPostalCode(event.target.value)}
            inputMode="numeric"
            maxLength={5}
          />
        </Field>
      </div>

      <div>
        <span className="mb-1.5 block text-[11px] font-bold text-soft">Aperçu de la position</span>
        <MapPreview address={address} city={city} postalCode={postalCode} />
      </div>
    </form>
  );
}

// Map preview component using Leaflet
function MapPreview({ address, city, postalCode }: { address: string; city: string; postalCode: string }) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;

    // Dynamic import to avoid SSR issues
    import("leaflet").then((L) => {
      if (cancelled || !mapContainerRef.current) return;

      import("leaflet/dist/leaflet.css").catch(() => {});

      // Fix default marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const newMap = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
      } as L.MapOptions).setView([43.6108, 3.8767], 13); // Default to Montpellier

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(newMap);

      // Geocode address using Nominatim
      const fullAddress = `${address}, ${postalCode} ${city}, France`;
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1`)
        .then((res) => res.json())
        .then((data) => {
          if (data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            newMap.setView([lat, lon], 15);
            L.marker([lat, lon]).addTo(newMap).bindPopup(`${address}<br>${postalCode} ${city}`).openPopup();
          }
        })
        .catch(() => {
          // Fallback to default location
        });

      mapRef.current = newMap;
    });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [address, city, postalCode]);

  return (
    <div
      ref={mapContainerRef}
      className="flex h-[200px] flex-col items-center justify-center gap-2 rounded-[13px] bg-[linear-gradient(135deg,var(--muted),color-mix(in_srgb,var(--mint)_60%,var(--muted)))] text-[11px] font-semibold text-mint-foreground"
    >
      <div className="w-full h-full" style={{ minHeight: 200 }} />
    </div>
  );
}

export default function VenuesPage() {
  const [rows, setRows] = useState<VenueRow[]>([]);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<VenueRow | null>(null);

  const { data: apiVenues, loading, error, reload } = useApiData<VenueDto[]>(() => api.venues.list(), []);

  useEffect(() => {
    setRows(
      (apiVenues ?? []).map((venue) => ({
        id: venue.id,
        name: venue.name,
        address: venue.address ?? "—",
        city: venue.city ?? "—",
        postalCode: venue.postalCode ?? "—",
        matches: "—",
      })),
    );
  }, [apiVenues]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchSearch = `${row.name} ${row.address} ${row.city} ${row.postalCode}`.toLowerCase().includes(needle);
      return matchSearch;
    });
  }, [rows, search]);

  const openCreate = () => {
    setEditing(null);
    setDrawerOpen(true);
  };

  const openEdit = (row: VenueRow) => {
    setEditing(row);
    setDrawerOpen(true);
  };

  const save = async (row: VenueRow) => {

    const address = row.address.trim() === "" || row.address === "—" ? null : row.address.trim();
    const city = row.city.trim() === "" || row.city === "—" ? null : row.city.trim();
    const postalCode = row.postalCode.trim() === "" || row.postalCode === "—" ? null : row.postalCode.trim();
    try {
      if (editing) await api.venues.update(row.id, { name: row.name, address, city, postalCode });
      else await api.venues.create({ name: row.name, address, city, postalCode });
      await reload();
      toast.success(editing ? "Le lieu a été mis à jour." : "Le lieu a été ajouté.");
      setDrawerOpen(false);
      setEditing(null);
    } catch (cause) {
      toast.error(errorMessage(cause));
    }
  };

  return (
    <>
      <PageHeader
        id="tour-venues-header"
        eyebrow="Référentiels"
        title="Lieux"
        description="Centralisez les gymnases et adresses avec ville et code postal."
        action={{ label: "Ajouter un lieu", icon: Plus, onClick: openCreate }}
      />

      <Filters
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Rechercher un gymnase, une ville, un code postal…"
        onReset={() => {
          setSearch("");
        }}
      />

      {error && (
        <div className="mb-4 rounded-xl bg-danger-soft px-4 py-3 text-[12px] font-medium text-danger">{error}</div>
      )}

      <DataTable
        id="tour-venues-table"
        rows={filtered}
        rowKey={(row) => row.id}
        minWidth={900}
        grid="1.3fr 1.3fr 1fr .8fr .8fr 36px"
        emptyMessage={loading ? "Chargement des lieux…" : undefined}
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
          {
            key: "city",
            label: "Ville / CP",
            render: (row) => `${row.city} ${row.postalCode !== "—" ? row.postalCode : ""}`.trim(),
          },
          { key: "matches", label: "Matchs à venir", render: (row) => row.matches },
          {
            key: "actions",
            label: "",
            render: (row) => (
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground"
                onClick={() => openEdit(row)}
                aria-label="Modifier"
              >
                <MoreHorizontal size={16} />
              </Button>
            ),
          },
        ]}
      />

      <FormSheet
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editing ? "Modifier le lieu" : "Ajouter un lieu"}
        subtitle="Adresse et géolocalisation"
        footer={
          <FormSheetFooter
            onCancel={() => setDrawerOpen(false)}
            submitLabel={editing ? "Enregistrer" : "Ajouter le lieu"}
            form="venue-form"
          />
        }
      >
        {drawerOpen && <Form key={editing?.id ?? "new"} row={editing} onSave={save} />}
      </FormSheet>
    </>
  );
}
