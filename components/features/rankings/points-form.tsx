"use client";

import { useState } from "react";
import { FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { EntityForm } from "@/components/shared/entity-form";
import { FormField } from "@/components/shared/form-field";
import { OptionSelect } from "@/components/shared/option-select";
import { POINT_CATEGORY_LABELS } from "@/lib/constants";
import { parsePoints } from "@/lib/utils";
import type { PersonDto, PointCategory, PointsPayload } from "@/types";

export const POINTS_FORM_ID = "points-form";

export function PointsForm({
  category,
  persons,
  onSave,
}: {
  category: PointCategory;
  persons: PersonDto[];
  onSave: (payload: PointsPayload) => void;
}) {
  const personOptions = persons.map((person) => person.id);
  const [target, setTarget] = useState(personOptions[0] ?? "");
  const [points, setPoints] = useState("5");
  const [motif, setMotif] = useState("Participation exceptionnelle");

  return (
    <>
      <EntityForm
        id={POINTS_FORM_ID}
        single
        onSubmit={() =>
          onSave({
            personId: personOptions.find((item) => item === target) ?? null,
            target,
            points: parsePoints(points),
            reason: motif,
          })
        }
      >
        <FormField label="Personne">
          {(id) => <OptionSelect id={id} value={target} onValueChange={setTarget} options={personOptions} />}
        </FormField>
        <FormField label="Catégorie">
          {(id) => <Input id={id} value={POINT_CATEGORY_LABELS[category] ?? category} readOnly />}
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
        <FormField label="Motif">
          {(id) => <Input id={id} value={motif} onChange={(e) => setMotif(e.target.value)} />}
        </FormField>
      </EntityForm>
      <div className="mt-4 rounded-xl bg-brand-soft px-3.5 py-3 text-[11px] leading-relaxed text-[#8e4200] dark:text-[#ffc48f]">
        L'ajustement crée une entrée dans l'historique des points et envoie une notification.
      </div>
    </>
  );
}
