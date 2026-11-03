"use client";

import { useEffect, useMemo, useState } from "react";
import { MoreHorizontal, Plus, ShieldCheck, X } from "lucide-react";
import { people, type Person } from "@/lib/data";
import { personToRow } from "@/lib/adapters";
import { api, errorMessage, USE_MOCK, type PersonDto } from "@/lib/api";
import { useApiData } from "@/lib/use-api-data";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/toast";
import {
  Avatar,
  DataTable,
  Drawer,
  DrawerFooter,
  Filters,
  FormField,
  PageHeader,
  SelectInput,
  Status,
  TextInput,
} from "@/components/ui";

type PersonRowEx = Person & { familyId?: string | null };

type PeopleResponse = { total: number; items: PersonDto[] };

const roleOptions = ["Parent", "Staff", "Admin"];

const roleTone: Record<string, string> = {
  Parent: "bg-info-soft text-info",
  Staff: "bg-mint text-mint-foreground",
  Admin: "bg-brand-soft text-brand",
};

type PersonPayload = {
  row: PersonRowEx;
  firstName: string;
  lastName: string;
  roles: string[];
  isActive: boolean;
  familyId: string | null;
};

function PersonForm({
  person,
  live,
  onSave,
}: {
  person: PersonRowEx | null;
  live: boolean;
  onSave: (payload: PersonPayload) => void;
}) {
  const [firstName, setFirstName] = useState(person?.name.split(" ")[0] ?? "");
  const [lastName, setLastName] = useState(person?.name.split(" ").slice(1).join(" ") ?? "");
  const [email, setEmail] = useState(person?.email ?? "");
  const [roles, setRoles] = useState<string[]>(person?.roles ?? ["Parent"]);
  const [status, setStatus] = useState(person?.status ?? (live ? "Actif" : "En attente"));

  const toggleRole = (role: string) => {
    setRoles((current) =>
      current.includes(role) ? current.filter((item) => item !== role) : [...current, role]
    );
  };

  return (
    <form
      id="person-form"
      onSubmit={(event) => {
        event.preventDefault();
        const finalRoles = roles.length ? roles : ["Parent"];
        onSave({
          row: {
            id: person?.id ?? `p${Date.now()}`,
            name: `${firstName} ${lastName}`.trim() || "Nouvelle personne",
            email,
            roles: finalRoles,
            status,
            lastLogin: person?.lastLogin ?? (live ? "—" : "Invitation envoyée"),
            familyId: person?.familyId ?? null,
          },
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          roles: finalRoles,
          isActive: status === "Actif",
          familyId: person?.familyId ?? null,
        });
      }}
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <FormField label="Prénom">
          <TextInput value={firstName} onChange={(event) => setFirstName(event.target.value)} required />
        </FormField>
        <FormField label="Nom">
          <TextInput value={lastName} onChange={(event) => setLastName(event.target.value)} required />
        </FormField>
        <FormField label="E-mail" wide>
          <TextInput type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </FormField>
        <FormField label="Statut" wide>
          <SelectInput
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            options={live ? ["Actif", "Suspendu"] : ["Actif", "En attente", "Suspendu"]}
          />
        </FormField>
      </div>

      <span className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-soft">Rôles et rangs</span>
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
                  : "border-line bg-card text-soft hover:bg-muted"
              )}
            >
              {active && <ShieldCheck size={14} />}
              {role}
            </button>
          );
        })}
      </div>

      {!live && (
        <div className="flex items-start gap-3 rounded-xl bg-info-soft px-3.5 py-3 text-[11px] leading-relaxed text-info">
          <ShieldCheck size={16} className="mt-0.5 shrink-0" />
          <span>
            Les administrateurs peuvent gérer les matchs, les membres et les pénalités. Les rôles sont cumulables
            au sein d&apos;un même compte.
          </span>
        </div>
      )}

      {live && !person && (
        <div className="flex items-start gap-3 rounded-xl bg-muted px-3.5 py-3 text-[11px] leading-relaxed text-soft">
          <ShieldCheck size={16} className="mt-0.5 shrink-0" />
          <span>
            Un mot de passe temporaire sera généré et affiché après la création. Communiquez-le à la personne,
            qui pourra le modifier ensuite.
          </span>
        </div>
      )}
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
  const { toast } = useToast();

  const { data: apiPeople, loading, error, reload } = useApiData<PeopleResponse>(
    () => api.people.list({ take: 200 }),
    { total: 0, items: [] }
  );

  useEffect(() => {
    if (USE_MOCK) return;
    setRows(
      apiPeople.items.map((person) => ({
        ...personToRow(person),
        familyId: person.familyId,
      }))
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

  const save = async (payload: PersonPayload) => {
    if (USE_MOCK) {
      if (editing) {
        setRows((current) => current.map((item) => (item.id === payload.row.id ? payload.row : item)));
        toast("Le compte a été mis à jour.");
      } else {
        setRows((current) => [payload.row, ...current]);
        toast("La personne a été ajoutée. Une invitation lui sera envoyée.");
      }
      setDrawerOpen(false);
      setEditing(null);
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await api.people.update(editing.id, {
          email: payload.row.email,
          firstName: payload.firstName,
          lastName: payload.lastName,
          familyId: payload.familyId,
        });

        const rolesChanged =
          editing.roles.length !== payload.roles.length ||
          editing.roles.some((item) => !payload.roles.includes(item));
        if (rolesChanged) await api.people.setRoles(editing.id, payload.roles);

        if ((editing.status === "Actif") !== payload.isActive) {
          await api.people.setActive(editing.id, payload.isActive);
        }

        toast("Le compte a été mis à jour.");
      } else {
        const created = await api.people.create({
          email: payload.row.email,
          firstName: payload.firstName,
          lastName: payload.lastName,
          roles: payload.roles,
          familyId: payload.familyId,
          password: null,
        });
        setTempPassword(created.temporaryPassword);
        toast(
          created.temporaryPassword
            ? "La personne a été ajoutée. Un mot de passe temporaire a été généré."
            : "La personne a été ajoutée."
        );
      }

      await reload();
      setDrawerOpen(false);
      setEditing(null);
    } catch (cause) {
      toast(errorMessage(cause), "danger");
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
                <Avatar name={row.name} tone={index % 3 === 0 ? "orange" : index % 3 === 1 ? "green" : "purple"} size="sm" />
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
          { key: "lastLogin", label: "Dernière connexion", render: (row) => <span className="text-soft">{row.lastLogin}</span> },
          {
            key: "actions",
            label: "",
            render: (row) => (
              <button onClick={() => openEdit(row)} aria-label="Modifier" className="grid size-8 place-items-center rounded-lg text-soft transition hover:bg-muted">
                <MoreHorizontal size={16} />
              </button>
            ),
          },
        ]}
      />

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editing ? "Modifier la personne" : "Ajouter une personne"}
        subtitle="Compte et autorisations"
        footer={
          <DrawerFooter
            onCancel={() => setDrawerOpen(false)}
            submitLabel={saving ? "Enregistrement…" : editing ? "Enregistrer" : "Envoyer l'invitation"}
            form="person-form"
          />
        }
      >
        {drawerOpen && (
          <PersonForm key={editing?.id ?? "new"} person={editing} live={!USE_MOCK} onSave={save} />
        )}
      </Drawer>
    </>
  );
}
