"use client";

import { useEffect, useState } from "react";
import { Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EntityForm } from "@/components/shared/entity-form";
import { FormField } from "@/components/shared/form-field";
import { OptionSelect } from "@/components/shared/option-select";
import { TEAM_STATUS_OPTIONS } from "@/lib/constants";
import type { NamedOption, TeamRow } from "@/types";

export const TEAM_FORM_ID = "team-form";

export function TeamForm({
  row,
  divisionOptions,
  venueOptions,
  staffOptions,
  onSave,
}: {
  row: TeamRow | null;
  divisionOptions: string[];
  venueOptions: NamedOption[];
  staffOptions: NamedOption[];
  onSave: (row: TeamRow) => void;
}) {
  const [name, setName] = useState(row?.name ?? "BOB1 U18 M");
  const [division, setDivision] = useState(row?.division ?? divisionOptions[0] ?? "U17 M");
  const [coach, setCoach] = useState(row?.coach ?? "");
  const [status, setStatus] = useState(row?.status ?? "Active");
  const [logo, setLogo] = useState(row?.logo ?? "");
  const [trainingVenueId, setTrainingVenueId] = useState(row?.trainingVenueId ?? "");
  const [trainingVenueName, setTrainingVenueName] = useState(row?.trainingVenueName ?? "");
  const [logoPreview, setLogoPreview] = useState<string | null>(row?.logo ?? null);

  // Divisions load asynchronously: keep the select on a valid option.
  useEffect(() => {
    if (divisionOptions.length > 0 && !divisionOptions.includes(division)) setDivision(divisionOptions[0]);
  }, [divisionOptions, division]);

  const submit = () => {
    const staffMatch = staffOptions.find((s) => s.name === coach);
    onSave({
      id: row?.id ?? `t${Date.now()}`,
      name,
      division,
      coach: coach || "À désigner",
      coachUserId: staffMatch?.id ?? null,
      logo: logoPreview,
      players: row?.players ?? "0 joueur",
      status,
      trainingVenueId: trainingVenueId || null,
      trainingVenueName: trainingVenueName || null,
    });
  };

  return (
    <EntityForm id={TEAM_FORM_ID} onSubmit={submit}>
      <FormField label="Nom de l'équipe" full>
        {(id) => <Input id={id} value={name} onChange={(e) => setName(e.target.value)} required />}
      </FormField>
      <FormField label="Division" full>
        {(id) => <OptionSelect id={id} value={division} onValueChange={setDivision} options={divisionOptions} />}
      </FormField>
      <FormField label="Coach principal" full>
        {(id) => (
          <>
            <Input
              id={id}
              value={coach}
              onChange={(e) => setCoach(e.target.value)}
              placeholder="Nom du coach (staff ou externe)"
              list="staff-suggestions"
            />
            <datalist id="staff-suggestions">
              {staffOptions.map((staff) => (
                <option key={staff.id} value={staff.name} />
              ))}
            </datalist>
          </>
        )}
      </FormField>
      <FormField label="Statut" full>
        {(id) => <OptionSelect id={id} value={status} onValueChange={setStatus} options={TEAM_STATUS_OPTIONS} />}
      </FormField>
      <FormField label="Lieu d'entraînement principal" full>
        {(id) => (
          <OptionSelect
            id={id}
            value={trainingVenueName || "Aucun"}
            onValueChange={(value) => {
              const venue = venueOptions.find((v) => v.name === value);
              setTrainingVenueId(venue?.id ?? "");
              setTrainingVenueName(value === "Aucun" ? "" : value);
            }}
            options={["Aucun", ...venueOptions.map((v) => v.name)]}
          />
        )}
      </FormField>

      <div className="col-span-full">
      <span className="mb-1.5 block text-[11px] font-bold text-soft">Logo de l'équipe</span>
      <label className="flex min-h-[112px] cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-line px-4 text-center transition hover:bg-muted/50">
        <input
          type="file"
          accept="image/png,image/svg+xml"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (e) => setLogoPreview(e.target?.result as string);
              reader.readAsDataURL(file);
              setLogo(file.name);
            }
          }}
        />
        <span className="grid size-9 place-items-center rounded-xl bg-muted text-soft">
          <Upload size={18} />
        </span>
        <strong className="mt-1 text-[12px]">{logo || logoPreview ? "Logo chargé" : "Importer un logo"}</strong>
        <small className="text-[10px] text-soft">PNG ou SVG · 2 Mo max.</small>
      </label>
      {logoPreview && (
        <div className="relative w-[120px] h-[120px] rounded-xl border border-line bg-card overflow-hidden">
          <img src={logoPreview} alt="Aperçu du logo" className="w-full h-full object-contain" />
          <button
            type="button"
            onClick={() => {
              setLogoPreview(null);
              setLogo("");
            }}
            className="absolute top-1 right-1 grid size-6 place-items-center rounded-full bg-danger text-white text-[10px] font-bold hover:bg-danger/80"
            aria-label="Supprimer le logo"
          >
            ×
          </button>
        </div>
      )}
      </div>
    </EntityForm>
  );
}
