"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { EntityForm } from "@/components/shared/entity-form";
import { FormField } from "@/components/shared/form-field";
import { OptionSelect } from "@/components/shared/option-select";
import { ACTIVE_STATUS_OPTIONS } from "@/lib/constants";
import { useLookups } from "@/hooks/use-lookups";
import type { DivisionRow } from "@/types";

export const DIVISION_FORM_ID = "division-form";

export function DivisionForm({ row, onSave }: { row: DivisionRow | null; onSave: (row: DivisionRow) => void }) {
  const { divisionGenders, divisionCategories } = useLookups();
  const [name, setName] = useState(row?.name ?? "");
  const [category, setCategory] = useState(row?.category ?? "");
  const [gender, setGender] = useState(row?.gender ?? "");
  const [status, setStatus] = useState(row?.status ?? ACTIVE_STATUS_OPTIONS[0]);

  return (
    <EntityForm
      id={DIVISION_FORM_ID}
      onSubmit={() =>
        onSave({ id: row?.id ?? `d${Date.now()}`, name, category: category || divisionCategories[0] || "", gender: gender || divisionGenders[0] || "", teams: row?.teams ?? "0 équipe", status })
      }
    >
      <FormField label="Nom" full>
        {(id) => <Input id={id} value={name} onChange={(e) => setName(e.target.value)} required />}
      </FormField>
      <FormField label="Catégorie">
        {(id) => <OptionSelect id={id} value={category} onValueChange={setCategory} options={divisionCategories} />}
      </FormField>
      <FormField label="Genre">
        {(id) => <OptionSelect id={id} value={gender} onValueChange={setGender} options={divisionGenders} />}
      </FormField>
      <FormField label="Statut">
        {(id) => <OptionSelect id={id} value={status} onValueChange={setStatus} options={ACTIVE_STATUS_OPTIONS} />}
      </FormField>
    </EntityForm>
  );
}
