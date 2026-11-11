"use client";

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { EntityForm } from "@/components/shared/entity-form";
import { FormField } from "@/components/shared/form-field";
import { OptionSelect } from "@/components/shared/option-select";
import { api } from "@/lib/api";
import { useLookups } from "@/hooks/use-lookups";
import { cn } from "@/lib/utils";
import type { DivisionDto, MembershipDto, Person, PersonPayload, TeamDto } from "@/types";

export const PERSON_FORM_ID = "person-form";

const NO_DIVISION = "Aucune";

export function PersonForm({
  person,
  divisions,
  teams,
  onSave,
}: {
  person: Person | null;
  divisions: DivisionDto[];
  teams: TeamDto[];
  onSave: (payload: PersonPayload) => void;
}) {
  const { roles: roleOptions } = useLookups();
  const [firstName, setFirstName] = useState(person?.name.split(" ")[0] ?? "");
  const [lastName, setLastName] = useState(person?.name.split(" ").slice(1).join(" ") ?? "");
  const [email, setEmail] = useState(person?.email ?? "");
  const [roles, setRoles] = useState<string[]>(person?.roles ?? (roleOptions[0] ? [roleOptions[0]] : []));
  const [isActive, setIsActive] = useState(person?.isActive ?? true);
  const [suspendedFromParticipation, setSuspendedFromParticipation] = useState(
    person?.suspendedFromParticipation ?? false,
  );
  const [divisionId, setDivisionId] = useState<string | null>(person?.divisionId ?? null);

  const [parcours, setParcours] = useState<MembershipDto[]>([]);
  const personId = person?.personId ?? person?.id;
  useEffect(() => {
    if (!personId) return;
    api.people.memberships(personId).then(setParcours).catch(() => setParcours([]));
  }, [personId]);

  const [teamIds, setTeamIds] = useState<string[]>(person?.teamIds ?? []);
  const toggleTeam = (id: string) =>
    setTeamIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));

  const toggleRole = (role: string) => {
    setRoles((current) => (current.includes(role) ? current.filter((item) => item !== role) : [...current, role]));
  };

  const submit = () =>
    onSave({
      personId: person?.personId ?? person?.id ?? "",
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      roles: roles.length ? roles : ["Parent"],
      isActive,
      suspendedFromParticipation,
      divisionId,
      teamIds,
    });

  return (
    <EntityForm id={PERSON_FORM_ID} onSubmit={submit}>
      <FormField label="Prénom">
        {(id) => <Input id={id} value={firstName} onChange={(e) => setFirstName(e.target.value)} required />}
      </FormField>
      <FormField label="Nom">
        {(id) => <Input id={id} value={lastName} onChange={(e) => setLastName(e.target.value)} required />}
      </FormField>
      <FormField label="E-mail" full>
        {(id) => <Input id={id} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />}
      </FormField>
      <FormField label="Division (joueur)" full>
        {(id) => (
          <OptionSelect
            id={id}
            value={divisions.find((item) => item.id === divisionId)?.name ?? NO_DIVISION}
            onValueChange={(name) => setDivisionId(divisions.find((item) => item.name === name)?.id ?? null)}
            options={[NO_DIVISION, ...divisions.map((item) => item.name)]}
          />
        )}
      </FormField>

      <span className="col-span-full mt-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-soft">
        Équipes (saison en cours)
      </span>
      <div className="col-span-full flex flex-wrap gap-2">
        {teams.length === 0 && <small className="text-soft">Aucune équipe.</small>}
        {teams.map((team) => {
          const active = teamIds.includes(team.id);
          return (
            <button
              key={team.id}
              type="button"
              onClick={() => toggleTeam(team.id)}
              aria-pressed={active}
              className={cn(
                "flex h-9 items-center gap-1.5 rounded-[10px] border px-3 text-[11.5px] font-semibold transition",
                active ? "border-transparent bg-mint text-mint-foreground" : "border-line bg-card text-soft hover:bg-muted",
              )}
            >
              {active && <ShieldCheck size={14} />}
              {team.name}
            </button>
          );
        })}
      </div>

      {parcours.length > 0 && (
        <div className="col-span-full flex flex-col gap-1.5">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-soft">Parcours</span>
          <ul className="flex flex-wrap gap-1.5">
            {parcours.map((item) => (
              <li key={item.season} className="rounded-full bg-muted px-2.5 py-1 text-[11px]">
                <strong>{item.season}</strong> · {item.divisionName}{item.teams.length > 0 && ` · ${item.teams.map((t) => t.name).join(", ")}`}
              </li>
            ))}
          </ul>
        </div>
      )}

      <span className="col-span-full mt-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-soft">Rôles</span>
      <div className="col-span-full flex flex-wrap gap-2">
        {roleOptions.map((role) => {
          const active = roles.includes(role);
          return (
            <button
              key={role}
              type="button"
              onClick={() => toggleRole(role)}
              aria-pressed={active}
              className={cn(
                "flex h-9 items-center gap-1.5 rounded-[10px] border px-3 text-[11.5px] font-semibold transition",
                active
                  ? "border-transparent bg-mint text-mint-foreground"
                  : "border-line bg-card text-soft hover:bg-muted",
              )}
            >
              {active && <ShieldCheck size={14} />}
              {role}
            </button>
          );
        })}
      </div>

      <div className="col-span-full flex items-center justify-between gap-3 rounded-xl bg-muted px-3.5 py-3">
        <span className="flex flex-col">
          <strong className="text-[12px]">Statut du compte</strong>
          <small className="mt-0.5 text-[10.5px] text-soft">Activer ou désactiver l'accès à l'application</small>
        </span>
        <Switch checked={isActive} onCheckedChange={setIsActive} />
      </div>

      <div className="col-span-full flex items-center justify-between gap-3 rounded-xl bg-muted px-3.5 py-3">
        <span className="flex flex-col">
          <strong className="text-[12px]">Suspendre la participation</strong>
          <small className="mt-0.5 text-[10.5px] text-soft">
            La personne pourra voir les informations mais ne pourra pas participer aux matchs en tant que joueur ou staff.
          </small>
        </span>
        <Switch checked={suspendedFromParticipation} onCheckedChange={setSuspendedFromParticipation} />
      </div>

      <div className="col-span-full rounded-xl bg-brand-soft px-3.5 py-3 text-[11px] leading-relaxed text-[#8e4200] dark:text-[#ffc48f]">
        La modification prend effet immédiatement. Une personne désactivée ne peut plus se connecter.
      </div>
    </EntityForm>
  );
}

