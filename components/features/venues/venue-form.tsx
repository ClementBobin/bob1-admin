"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { EntityForm } from "@/components/shared/entity-form";
import { FormField } from "@/components/shared/form-field";
import { MapPreview } from "./map-preview";
import type { VenueRow } from "@/types";

export const VENUE_FORM_ID = "venue-form";

export function VenueForm({ row, onSave }: { row: VenueRow | null; onSave: (row: VenueRow) => void }) {
  const [name, setName] = useState(row?.name ?? "Nouveau gymnase");
  const [address, setAddress] = useState(row?.address ?? "12 rue des Sports");
  const [city, setCity] = useState(row?.city ?? "Montpellier");
  const [postalCode, setPostalCode] = useState(row?.postalCode ?? "34000");

  return (
    <EntityForm
      id={VENUE_FORM_ID}
      onSubmit={() =>
        onSave({ id: row?.id ?? `v${Date.now()}`, name, address, city, postalCode })
      }
    >
      <FormField label="Nom du lieu" full>
        {(id) => <Input id={id} value={name} onChange={(e) => setName(e.target.value)} required />}
      </FormField>
      <FormField label="Adresse" full>
        {(id) => <Input id={id} value={address} onChange={(e) => setAddress(e.target.value)} required />}
      </FormField>
      <FormField label="Ville">
        {(id) => <Input id={id} value={city} onChange={(e) => setCity(e.target.value)} required />}
      </FormField>
      <FormField label="Code postal">
        {(id) => (
          <Input
            id={id}
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            inputMode="numeric"
            maxLength={5}
          />
        )}
      </FormField>
      <div className="col-span-full">
        <span className="mb-1.5 block text-[11px] font-bold text-soft">Aperçu de la position</span>
        <MapPreview address={address} city={city} postalCode={postalCode} />
      </div>
    </EntityForm>
  );
}
