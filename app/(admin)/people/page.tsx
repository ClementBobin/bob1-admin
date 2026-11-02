"use client";

import { useMemo, useState } from "react";
import { MoreHorizontal, Plus, ShieldCheck } from "lucide-react";
import { people, type Person } from "@/lib/data";
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

const roleOptions = ["Parent", "Staff", "Admin"];

const roleTone: Record<string, string> = {
  Parent: "bg-info-soft text-info",
  Staff: "bg-mint text-mint-foreground",
  Admin: "bg-brand-soft text-brand",
};

function PersonForm({ person, onSave }: { person: Person | null; onSave: (person: Person) => void }) {
  const [firstName, setFirstName] = useState(person?.name.split(" ")[0] ?? "");
  const [lastName, setLastName] = useState(person?.name.split(" ").slice(1).join(" ") ?? "");
  const [email, setEmail] = useState(person?.email ?? "");
  const [roles, setRoles] = useState<string[]>(person?.roles ?? ["Parent"]);
  const [status, setStatus] = useState(person?.status ?? "En attente");

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
        onSave({
          id: person?.id ?? `p${Date.now()}`,
          name: `${firstName} ${lastName}`.trim() || "Nouvelle personne",
          email,
          roles: roles.length ? roles : ["Parent"],
          status,
          lastLogin: person?.lastLogin ?? "Invitation envoyée",
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
          <SelectInput value={status} onChange={(event) => setStatus(event.target.value)} options={["Actif", "En attente", "Suspendu"]} />
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

      <div className="flex items-start gap-3 rounded-xl bg-info-soft px-3.5 py-3 text-[11px] leading-relaxed text-info">
        <ShieldCheck size={16} className="mt-0.5 shrink-0" />
        <span>
          Les administrateurs peuvent gérer les matchs, les membres et les pénalités. Les rôles sont cumulables
          au sein d&apos;un même compte.
        </span>
      </div>
    </form>
  );
}

export default function PeoplePage() {
  const [rows, setRows] = useState<Person[]>(people);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("Tous les rôles");
  const [status, setStatus] = useState("Tous les statuts");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Person | null>(null);
  const { toast } = useToast();

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

  const openEdit = (row: Person) => {
    setEditing(row);
    setDrawerOpen(true);
  };

  const save = (person: Person) => {
    if (editing) {
      setRows((current) => current.map((item) => (item.id === person.id ? person : item)));
      toast("Le compte a été mis à jour.");
    } else {
      setRows((current) => [person, ...current]);
      toast("La personne a été ajoutée. Une invitation lui sera envoyée.");
    }
    setDrawerOpen(false);
    setEditing(null);
  };

  return (
    <>
      <PageHeader
        id="tour-people-header"
        eyebrow="Membres"
        title="Personnes"
        description="Gérez les comptes et leurs différents rôles."
        action={{ label: "Ajouter une personne", icon: Plus, onClick: openCreate }}
      />

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
            options: ["Tous les statuts", "Actif", "En attente", "Suspendu"],
            onChange: setStatus,
          },
        ]}
        onReset={() => {
          setSearch("");
          setRole("Tous les rôles");
          setStatus("Tous les statuts");
        }}
      />

      <DataTable
        id="tour-people-table"
        rows={filtered}
        rowKey={(row) => row.id}
        minWidth={940}
        grid="1.25fr 1.35fr 1.3fr .8fr 1fr 36px"
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
            submitLabel={editing ? "Enregistrer" : "Envoyer l'invitation"}
            form="person-form"
          />
        }
      >
        {drawerOpen && <PersonForm key={editing?.id ?? "new"} person={editing} onSave={save} />}
      </Drawer>
    </>
  );
}
