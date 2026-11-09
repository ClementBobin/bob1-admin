"use client";

import { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EntityForm } from "@/components/shared/entity-form";
import { FormField } from "@/components/shared/form-field";
import { OptionSelect } from "@/components/shared/option-select";
import { formatDateLabel, localDateParts } from "@/lib/utils";
import type { MatchPayload, MatchRow, SlotTemplate } from "@/types";

export const MATCH_FORM_ID = "match-form";

const withCurrent = (options: string[], current: string) =>
  current && !options.includes(current) ? [current, ...options] : options;

export function MatchForm({
  match,
  divisionOptions,
  venueOptions,
  teamOptions,
  slotTemplates,
  onSave,
}: {
  match: MatchRow | null;
  divisionOptions: string[];
  venueOptions: string[];
  teamOptions: string[];
  slotTemplates: SlotTemplate[];
  onSave: (payload: MatchPayload) => void;
}) {
  const initial = localDateParts(match?.startsAtUtc);
  const [division, setDivision] = useState(
    match?.division ?? divisionOptions[0] ?? "",
  );
  const [homeTeam, setHomeTeam] = useState(match?.home ?? "");
  const [awayTeam, setAwayTeam] = useState(match?.away ?? "");
  const [date, setDate] = useState(initial.date);
  const [time, setTime] = useState(initial.time);
  const [venue, setVenue] = useState(match?.venue ?? venueOptions[0] ?? "");
  const existingSlots: Record<string, number | undefined> = {
    arbitres: match?.officials[1],
    chrono: match?.chrono[1],
    mar: match?.mar[1],
    buvette: match?.buvette[1],
  };
  const [slotOverrides, setSlotOverrides] = useState<Record<string, number>>(
    {},
  );
  const slots: Record<string, number> = Object.fromEntries(
    slotTemplates.map((slot) => [
      slot.key,
      slotOverrides[slot.key] ??
        (match ? (existingSlots[slot.key] ?? 0) : slot.defaultCapacity),
    ]),
  );

  // Divisions/venues load asynchronously; keep the selects on a valid option.
  useEffect(() => {
    if (divisionOptions.length > 0 && !divisionOptions.includes(division))
      setDivision(divisionOptions[0]);
  }, [divisionOptions, division]);

  useEffect(() => {
    if (venueOptions.length > 0 && !venueOptions.includes(venue))
      setVenue(venueOptions[0]);
  }, [venueOptions, venue]);

  // Teams load asynchronously too: never leave a side empty once they are known.
  useEffect(() => {
    if (teamOptions.length === 0) return;
    if (!homeTeam) setHomeTeam(teamOptions[0]);
    if (!awayTeam) setAwayTeam(teamOptions.find((name) => name !== homeTeam) ?? teamOptions[0]);
  }, [teamOptions, homeTeam, awayTeam]);

  const updateSlot = (key: string, amount: number) => {
    setSlotOverrides((current) => ({
      ...current,
      [key]: Math.max(0, Math.min(12, slots[key] + amount)),
    }));
  };

  return (
    <>
      <EntityForm
        id={MATCH_FORM_ID}
        onSubmit={() => {
          onSave({
            divisionName: division,
            homeTeamName: homeTeam,
            awayTeamName: awayTeam,
            venueName: venue,
            date,
            time,
            slots,
            row: {
              id: match?.id ?? `m${Date.now()}`,
              date: formatDateLabel(date, time),
              division,
              home: homeTeam,
              away: awayTeam,
              venue,
              officials: [match?.officials[0] ?? 0, slots.arbitres ?? 0],
              buvette: [match?.buvette[0] ?? 0, slots.buvette ?? 0],
              chrono: [0, slots.chrono ?? 0],
              mar: [0, slots.mar ?? 0],
              carpool: match?.carpool ?? "0 place",
              status: match?.status ?? "Brouillon",
              startsAtUtc: new Date(`${date}T${time}:00`).toISOString(),
            },
          });
        }}
      >
        <FormField label="Division" full>
          {(id) => (
            <OptionSelect
              id={id}
              value={division}
              onValueChange={setDivision}
              options={divisionOptions}
            />
          )}
        </FormField>

        <FormField label="Équipe à domicile">
          {(id) => (
            <OptionSelect
              id={id}
              value={homeTeam}
              onValueChange={setHomeTeam}
              options={withCurrent(teamOptions, homeTeam)}
            />
          )}
        </FormField>
        <FormField label="Équipe à l'extérieur">
          {(id) => (
            <OptionSelect
              id={id}
              value={awayTeam}
              onValueChange={setAwayTeam}
              options={withCurrent(teamOptions, awayTeam)}
            />
          )}
        </FormField>

        <FormField label="Date">
          {(id) => (
            <Input
              id={id}
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          )}
        </FormField>
        <FormField label="Heure">
          {(id) => (
            <Input
              id={id}
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              required
            />
          )}
        </FormField>
        <FormField label="Lieu" full>
          {(id) => (
            <OptionSelect
              id={id}
              value={venue}
              onValueChange={setVenue}
              options={venueOptions}
            />
          )}
        </FormField>
      </EntityForm>

      <span className="mt-6 block text-[10px] font-extrabold uppercase tracking-[0.08em] text-soft">
        Postes nécessaires
      </span>
      <div className="mt-3 overflow-hidden rounded-[13px] border border-line">
        {slotTemplates.map(({ key, role: label }) => (
          <div
            key={key}
            className="flex min-h-[50px] items-center justify-between gap-3 border-b border-line px-3.5 last:border-b-0"
          >
            <span className="text-[12.5px] font-medium">{label}</span>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => updateSlot(key, -1)}
                aria-label={`Retirer un poste ${label}`}
                className="grid size-7 place-items-center rounded-lg border border-line text-soft transition hover:bg-muted disabled:opacity-40"
                disabled={slots[key] === 0}
              >
                <Minus size={13} />
              </button>
              <b className="w-5 text-center text-[12px] font-bold">
                {slots[key]}
              </b>
              <button
                type="button"
                onClick={() => updateSlot(key, 1)}
                aria-label={`Ajouter un poste ${label}`}
                className="grid size-7 place-items-center rounded-lg border border-line text-soft transition hover:bg-muted"
              >
                <Plus size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 rounded-xl bg-muted px-3.5 py-3 text-[11px] leading-relaxed text-soft">
        Les postes saisis sont créés en même temps que le match. Vous pourrez
        les ajuster depuis la fiche du match.
      </p>
    </>
  );
}
