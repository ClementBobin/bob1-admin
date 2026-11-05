"use client";

import { useState } from "react";
import { FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { parsePoints } from "@/lib/utils";
import { EntityForm } from "@/components/shared/entity-form";
import { FormField } from "@/components/shared/form-field";
import { OptionSelect } from "@/components/shared/option-select";
import type { HistoryRow, PointsPayload } from "@/types";

export const HISTORY_FORM_ID = "history-form";

export function HistoryForm({
  row,
  personOptions,
  categoryOptions,
  onSave,
}: {
  row: HistoryRow | null;
  personOptions: string[];
  categoryOptions: string[];
  onSave: (payload: PointsPayload) => void;
}) {
  const [person, setPerson] = useState(row?.person ?? personOptions[0] ?? "");
  const [category, setCategory] = useState(row?.category ?? "penalty");
  const [reason, setReason] = useState(row?.reason ?? "");
  const [points, setPoints] = useState(row ? `${row.points > 0 ? "+" : ""}${row.points}` : "-10");

  const submit = () =>
    onSave({
      personId: personOptions.includes(person) ? person : null,
      target: person,
      points: parsePoints(points),
      reason,
      category,
    });

  return (
    <>
      <EntityForm id={HISTORY_FORM_ID} onSubmit={submit} single>
        <FormField label="Personne">
          {(id) => <OptionSelect id={id} value={person} onValueChange={setPerson} options={personOptions} />}
        </FormField>
        <FormField label="Catégorie">
          {(id) => <OptionSelect id={id} value={category} onValueChange={setCategory} options={categoryOptions} />}
        </FormField>
        <FormField label="Motif">
          {(id) => (
            <Input id={id} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Saisissez le motif" />
          )}
        </FormField>
        <FormField label="Points">
          {(id) => (
            <>
              <Input
                id={id}
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                inputMode="numeric"
                type="number"
              />
              <FieldDescription className="text-[10px]">Un nombre négatif retire des points.</FieldDescription>
            </>
          )}
        </FormField>
      </EntityForm>
      <div className="mt-4 rounded-xl bg-brand-soft px-3.5 py-3 text-[11px] leading-relaxed text-[#8e4200] dark:text-[#ffc48f]">
        L'ajustement crée une entrée dans l'historique des points et envoie une notification à la personne concernée. Les
        points positifs = bonus, points négatifs = pénalité.
      </div>
    </>
  );
}
