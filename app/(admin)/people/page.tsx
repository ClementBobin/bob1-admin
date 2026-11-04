"use client";

import { useEffect, useMemo, useState } from "react";
import { MoreHorizontal, Plus, ShieldCheck, X } from "lucide-react";
import { people, type Person } from "@/lib/data";
import { personToRow } from "@/lib/adapters";
import { api, errorMessage, USE_MOCK, type PersonDto } from "@/lib/api";
import { useApiData } from "@/lib/use-api-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { OptionSelect } from "@/components/option-select";
import { InitialsAvatar } from "@/components/initials-avatar";
import { Status } from "@/components/status";
import { DataTable } from "@/components/data-table";
import { Filters } from "@/components/filters";
import { PageHeader } from "@/components/page-header";
import { FormSheet, FormSheetFooter } from "@/components/form-sheet";

type PersonRowEx = Person & { familyId?: string | null; personId?: string };

type PeopleResponse = { total: number; items: PersonDto[] };

const roleOptions = ["Parent", "Staff", "Admin"];

const roleTone: Record<string, string> = {
  Parent: "bg-info-soft text-info",
  Staff: "bg-mint text-mint-foreground",
  Admin: "bg-brand-soft text-brand",
};

function PersonForm({
  person,
  live,
  onSave,
}: {
  person: PersonRowEx | null;
  live: boolean;
  onSave: (payload: {
    personId: string;
    firstName: string;
    lastName: string;
    email: string;
    roles: string[];
    isActive: boolean;
    suspendedFromParticipation: boolean;
  }) => void;
}) {
  const [firstName, setFirstName] = useState(person?.name.split(" ")[0] ?? "");
  const [lastName, setLastName] = useState(person?.name.split(" ").slice(1).join(" ") ?? "");
  const [email, setEmail] = useState(person?.email ?? "");
  const [roles, setRoles] = useState<string[]>(person?.roles ?? ["Parent"]);
  const [status, setStatus] = useState(person?.status ?? (live ? "Actif" : "En attente"));
  const [suspendedFromParticipation, setSuspendedFromParticipation] = useState(person?.suspendedFromParticipation ?? false);

  const toggleRole = (role: string) => {
    setRoles((current) => (current.includes(role) ? current.filter((item) => item !== role) : [...current, role]));
  };

  return (
    <form
      id="person-form"
      onSubmit={(event) => {
        event.preventDefault();
        const finalRoles = roles.length ? roles : ["Parent"];
        onSave({
          personId: person?.personId ?? person?.id ?? "",
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          roles: finalRoles,
          isActive: status === "Actif",
          suspendedFromParticipation,
        });
      }}
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="people-field-14" className="text-[11px] font-bold text-muted-foreground">
            Prénom
          </FieldLabel>
          <Input
            id="people-field-14"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="people-field-15" className="text-[11px] font-bold text-muted-foreground">
            Nom
          </FieldLabel>
          <Input id="people-field-15" value={lastName} onChange={(event) => setLastName(event.target.value)} required />
        </Field>
        <Field className="col-span-full">
          <FieldLabel htmlFor="people-field-16" className="text-[11px] font-bold text-muted-foreground">
            E-mail
          </FieldLabel>
          <Input
            id="people-field-16"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </Field>
        <Field className="col-span-full">
          <FieldLabel htmlFor="people-field-17" className="text-[11px] font-bold text-muted-foreground">
            Statut
          </FieldLabel>
          <OptionSelect
            id="people-field-17"
            value={status}
            onValueChange={setStatus}
            options={live ? ["Actif", "Suspendu"] : ["Actif", "En attente", "Suspendu"]}
          />
        </Field>
      </div>

      <span className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-soft">Rôles</span>
      <div className="flex flex-wrap gap-2">
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

      <div className="flex items-center justify-between gap-3 rounded-xl bg-muted px-3.5 py-3">
        <span className="flex flex-col">
          <strong className="text-[12px]">Statut du compte</strong>
          <small className="mt-0.5 text-[10.5px] text-soft">Activer ou suspendre l'accès à l'application</small>
        </span>
        <Switch checked={status === "Actif"} onCheckedChange={(checked) => setStatus(checked ? "Actif" : "Suspendu")} />
      </div>

      <div className="flex items-center justify-between gap-3 rounded-xl bg-muted px-3.5 py-3">
        <span className="flex flex-col">
          <strong className="text-[12px]">Suspendre la participation</strong>
          <small className="mt-0.5 text-[10.5px] text-soft">
            La personne pourra voir les informations mais ne pourra pas participer aux matchs en tant que joueur ou staff.
          </small>
        </span>
        <Switch checked={suspendedFromParticipation} onCheckedChange={setSuspendedFromParticipation} />
      </div>

      <div className="rounded-xl bg-brand-soft px-3.5 py-3 text-[11px] leading-relaxed text-[#8e4200] dark:text-[#ffc48f]">
        La modification prend effet immédiatement. Une personne suspendue ne peut plus se connecter.
      </div>
    </form>
  );
}

export default function PeoplePage() {
  const [rows, setRows] = useState<PersonRowEx[]>(USE_MOCK ? people : []);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("Tous les rôles");
  const [status, setStatus] = useState("Tous les statuts");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<PersonRowEx | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    data: apiPeople,
    loading,
    error,
    reload,
  } = useApiData<PeopleResponse>(() => api.people.list({ take: 200 }), { total: 0, items: [] });

  useEffect(() => {
    if (USE_MOCK) return;
    setRows(
      apiPeople.items.map((person) => ({
        ...personToRow(person),
        familyId: person.familyId,
        personId: person.id,
      })),
    );
  }, [apiPeople]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchSearch = `${row.name} ${row.email} ${row.roles.join(" ")}`.toLowerCase().includes(needle);
      const matchRole = role === "Tous les rôles" || row.roles.includes(role);
      const matchStatus = status === "Tous les statuts" || row.status === status;
      return matchSearch && matchRole && matchStatus;
    });
  }, [rows, search, role, status]);

  const openCreate = () => {
    setEditing(null);
    setDrawerOpen(true);
  };

  const openEdit = (row: PersonRowEx) => {
    setEditing(row);
    setDrawerOpen(true);
  };

  const save = async (payload: {
    personId: string;
    firstName: string;
    lastName: string;
    email: string;
    roles: string[];
    isActive: boolean;
    suspendedFromParticipation: boolean;
  }) => {
    if (USE_MOCK) {
      if (editing) {
        setRows((current) =>
          current.map((item) =>
            item.id === payload.personId
              ? {
                  ...item,
                  name: `${payload.firstName} ${payload.lastName}`,
                  email: payload.email,
                  roles: payload.roles,
                  status: payload.isActive ? "Actif" : "Suspendu",
                  suspendedFromParticipation: payload.suspendedFromParticipation,
                }
              : item,
          ),
        );
        toast.success("Le compte a été mis à jour.");
      } else {
        setRows((current) => [
          {
            id: `p${Date.now()}`,
            name: `${payload.firstName} ${payload.lastName}`,
            email: payload.email,
            roles: payload.roles,
            status: payload.isActive ? "Actif" : "Suspendu",
            suspendedFromParticipation: payload.suspendedFromParticipation,
            lastLogin: "Invitation envoyée",
          },
          ...current,
        ]);
        toast.success("La personne a été ajoutée. Une invitation lui sera envoyée.");
      }
      setDrawerOpen(false);
      setEditing(null);
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await api.people.update(editing.id, {
          email: payload.email,
          firstName: payload.firstName,
          lastName: payload.lastName,
          familyId: editing.familyId,
        });

        const rolesChanged =
          editing.roles.length !== payload.roles.length || editing.roles.some((item) => !payload.roles.includes(item));
        if (rolesChanged) await api.people.setRoles(editing.id, payload.roles);

        if ((editing.status === "Actif") !== payload.isActive) {
          await api.people.setActive(editing.id, payload.isActive);
        }

        if (editing.suspendedFromParticipation !== payload.suspendedFromParticipation) {
          await api.people.setSuspendedFromParticipation(editing.id, payload.suspendedFromParticipation);
        }

        toast.success("Le compte a été mis à jour.");
      } else {
        const created = await api.people.create({
          email: payload.email,
          firstName: payload.firstName,
          lastName: payload.lastName,
          roles: payload.roles,
          familyId: null,
          password: null,
        });
        setTempPassword(created.temporaryPassword);
        toast.success(
          created.temporaryPassword
            ? "La personne a été ajoutée. Un mot de passe temporaire a été généré."
            : "La personne a été ajoutée.",
        );
      }

      await reload();
      setDrawerOpen(false);
      setEditing(null);
    } catch (cause) {
      toast.error(errorMessage(cause));
    } finally {
      setSaving(false);
    }
  };

  const statusOptions = USE_MOCK
    ? ["Tous les statuts", "Actif", "En attente", "Suspendu"]
    : ["Tous les statuts", "Actif", "Suspendu"];

  return (
    <>
      <PageHeader
        id="tour-people-header"
        eyebrow="Membres"
        title="Personnes"
        description="Gérez les comptes et leurs différents rôles."
        action={{ label: "Ajouter une personne", icon: Plus, onClick: openCreate }}
      />

      {tempPassword && (
        <div className="mb-4 flex items-start justify-between gap-3 rounded-xl bg-info-soft px-4 py-3 text-[11.5px] leading-relaxed text-info">
          <span>
            <strong className="block">Mot de passe temporaire généré</strong>
            <code className="mt-1 block select-all font-mono text-[12.5px]">{tempPassword}</code>
            <span className="mt-1 block opacity-80">
              Transmettez-le à la personne : il ne sera plus affiché après la fermeture de ce message.
            </span>
          </span>
          <button
            onClick={() => setTempPassword(null)}
            aria-label="Masquer le mot de passe temporaire"
            className="grid size-7 shrink-0 place-items-center rounded-lg transition hover:bg-info/10"
          >
            <X size={15} />
          </button>
        </div>
      )}

      <Filters
        id="tour-people-filters"
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Rechercher une personne, un e-mail…"
        selects={[
          {
            label: "Rôle",
            value: role,
            options: ["Tous les rôles", ...roleOptions],
            onChange: setRole,
          },
          {
            label: "Statut",
            value: status,
            options: statusOptions,
            onChange: setStatus,
          },
        ]}
        onReset={() => {
          setSearch("");
          setRole("Tous les rôles");
          setStatus("Tous les statuts");
        }}
      />

      {!USE_MOCK && error && (
        <div className="mb-4 rounded-xl bg-danger-soft px-4 py-3 text-[12px] font-medium text-danger">{error}</div>
      )}

      <DataTable
        id="tour-people-table"
        rows={filtered}
        rowKey={(row) => row.id}
        minWidth={940}
        grid="1.25fr 1.35fr 1.3fr .8fr 1fr 36px"
        emptyMessage={loading ? "Chargement des comptes…" : undefined}
        columns={[
          {
            key: "person",
            label: "Personne",
            render: (row, index) => (
              <span className="flex items-center gap-2.5">
                <InitialsAvatar
                  name={row.name}
                  tone={index % 3 === 0 ? "orange" : index % 3 === 1 ? "green" : "purple"}
                  size="sm"
                />
                <strong className="truncate">{row.name}</strong>
              </span>
            ),
          },
          { key: "email", label: "E-mail", render: (row) => <span className="truncate text-soft">{row.email}</span> },
          {
            key: "roles",
            label: "Rôles",
            render: (row) => (
              <span className="flex flex-wrap gap-1">
                {row.roles.map((item) => (
                  <b key={item} className={cn("rounded-full px-2 py-1 text-[9.5px] font-bold", roleTone[item])}>
                    {item}
                  </b>
                ))}
              </span>
            ),
          },
          {
            key: "status",
            label: "Statut",
            render: (row) => (
              <Status tone={row.status === "Actif" ? "success" : row.status === "Suspendu" ? "danger" : "warning"}>
                {row.status}
              </Status>
            ),
          },
          {
            key: "lastLogin",
            label: "Dernière connexion",
            render: (row) => <span className="text-soft">{row.lastLogin}</span>,
          },
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
        title={editing ? "Modifier la personne" : "Ajouter une personne"}
        subtitle="Compte et autorisations"
        footer={
          <FormSheetFooter
            onCancel={() => setDrawerOpen(false)}
            submitLabel={saving ? "Enregistrement…" : editing ? "Enregistrer" : "Envoyer l'invitation"}
            form="person-form"
          />
        }
      >
        {drawerOpen && <PersonForm key={editing?.id ?? "new"} person={editing} live={!USE_MOCK} onSave={save} />}
      </FormSheet>
    </>
  );
}
