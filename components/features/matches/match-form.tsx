"use client";

import { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EntityForm } from "@/components/shared/entity-form";
import { FormField } from "@/components/shared/form-field";
import { OptionSelect } from "@/components/shared/option-select";
import { SLOT_SPECS, TEAM_OPTIONS } from "@/lib/constants";
import { formatDateLabel, localDateParts } from "@/lib/utils";
import type { MatchPayload, MatchRow } from "@/types";

export const MATCH_FORM_ID = "match-form";

export function MatchForm({
  match,
  divisionOptions,
  venueOptions,
  onSave,
}: {
  match: MatchRow | null;
  divisionOptions: string[];
  venueOptions: string[];
  onSave: (payload: MatchPayload) => void;
}) {
  const initial = localDateParts(match?.startsAtUtc);
  const [division, setDivision] = useState(
    match?.division ?? divisionOptions[0] ?? "U13 M",
  );
  const [homeTeam, setHomeTeam] = useState(match?.home ?? "BOB1");
  const [awayTeam, setAwayTeam] = useState(match?.away ?? "Castelnau Basket");
  const [date, setDate] = useState(initial.date);
  const [time, setTime] = useState(initial.time);
  const [venue, setVenue] = useState(
    match?.venue ?? venueOptions[0] ?? "Coubertin",
  );
  const [slots, setSlots] = useState<Record<string, number>>({
    arbitres: match?.officials[1] || 4,
    chrono: match?.chrono[1] || 1,
    mar: match?.mar[1] || 1,
    buvette: match?.buvette[1] || 2,
  });

  // Divisions/venues load asynchronously; keep the selects on a valid option.
  useEffect(() => {
    if (divisionOptions.length > 0 && !divisionOptions.includes(division))
      setDivision(divisionOptions[0]);
  }, [divisionOptions, division]);

  useEffect(() => {
    if (venueOptions.length > 0 && !venueOptions.includes(venue))
      setVenue(venueOptions[0]);
  }, [venueOptions, venue]);

  const updateSlot = (key: string, amount: number) => {
    setSlots((current) => ({
      ...current,
      [key]: Math.max(0, Math.min(12, current[key] + amount)),
    }));
  };

  return (
    <>
      <EntityForm
        id={MATCH_FORM_ID}
        onSubmit={() => {
          const isHome =
            homeTeam === "BOB1" ||
            homeTeam === "BOB1 U13 M" ||
            homeTeam.startsWith("BOB1");
          const opponentName = isHome ? awayTeam : homeTeam;
          onSave({
            divisionName: division,
            opponent: opponentName,
            isHome,
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
              officials: [match?.officials[0] ?? 0, slots.arbitres],
              buvette: [match?.buvette[0] ?? 0, slots.buvette],
              chrono: [0, slots.chrono],
              mar: [0, slots.mar],
              carpool: match?.carpool ?? "0 place",
              status: match?.status ?? "Brouillon",
              opponent: opponentName,
              isHome,
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
              options={TEAM_OPTIONS}
            />
          )}
        </FormField>
        <FormField label="Équipe à l'extérieur">
          {(id) => (
            <OptionSelect
              id={id}
              value={awayTeam}
              onValueChange={setAwayTeam}
              options={TEAM_OPTIONS}
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
        {SLOT_SPECS.map(({ key, label }) => (
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
