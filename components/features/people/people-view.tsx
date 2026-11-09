"use client";

import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { personToRow } from "@/lib/adapters";
import { api, errorMessage } from "@/lib/api";
import { FILTER_ALL, PERSON_STATUS_OPTIONS, ROLE_TONE_CLASSES, statusTone } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { usePagedQuery } from "@/hooks/use-paged-query";
import { useFormSheet } from "@/hooks/use-form-sheet";
import { useApiData } from "@/hooks/use-api-data";
import { useLookups } from "@/hooks/use-lookups";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/shared/data-table";
import { ErrorBanner } from "@/components/shared/error-banner";
import { Filters } from "@/components/shared/filters";
import { FormSheet, FormSheetFooter } from "@/components/shared/form-sheet";
import { InitialsAvatar } from "@/components/shared/initials-avatar";
import { RowActionButton } from "@/components/shared/row-action-button";
import { Status } from "@/components/shared/status";
import { PERSON_FORM_ID, PersonForm } from "./person-form";
import type { DivisionDto, Person, PersonPayload } from "@/types";

export function PeopleView() {
  const { roles } = useLookups();
  const [rows, setRows] = useState<Person[]>([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState(FILTER_ALL.roles);
  const [status, setStatus] = useState(FILTER_ALL.statuses);
  const sheet = useFormSheet<Person>();
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const query = usePagedQuery((params) => api.people.list(params), {
    search,
    role: role === FILTER_ALL.roles ? undefined : role,
    isActive: status === FILTER_ALL.statuses ? undefined : status === "Actif",
  });
  const { items: apiPeople, loading, error, reload } = query;
  const { data: apiDivisions } = useApiData<DivisionDto[]>(() => api.divisions.all(), []);

  useEffect(() => {
    setRows(
      (apiPeople || []).map((person) => ({
        ...personToRow(person),
        familyId: person.familyId,
        divisionId: person.divisionId,
        personId: person.id,
      })),
    );
  }, [apiPeople]);

  const save = async (payload: PersonPayload) => {
    const editing = sheet.editing;
    setSaving(true);
    try {
      if (editing) {
        await api.people.update(editing.id, {
          email: payload.email,
          firstName: payload.firstName,
          lastName: payload.lastName,
          familyId: editing.familyId,
          divisionId: payload.divisionId,
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
          divisionId: payload.divisionId,
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
      sheet.close();
    } catch (cause) {
      toast.error(errorMessage(cause));
    } finally {
      setSaving(false);
    }
  };

  const statusOptions = [FILTER_ALL.statuses, ...PERSON_STATUS_OPTIONS];

  return (
    <>
      <PageHeader
        id="tour-people-header"
        eyebrow="Membres"
        title="Personnes"
        description="Gérez les comptes et leurs différents rôles."
        action={{ label: "Ajouter une personne", icon: Plus, onClick: sheet.openCreate }}
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
            options: [FILTER_ALL.roles, ...roles],
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
          setRole(FILTER_ALL.roles);
          setStatus(FILTER_ALL.statuses);
        }}
      />

      <ErrorBanner message={error} />

      <DataTable
        id="tour-people-table"
        rows={rows}
        server={{ total: query.total, page: query.page, onPageChange: query.setPage }}
        pageSize={query.pageSize}
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
                  <b key={item} className={cn("rounded-full px-2 py-1 text-[9.5px] font-bold", ROLE_TONE_CLASSES[item])}>
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
              <Status tone={statusTone(row.status)}>{row.status}</Status>
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
            render: (row) => <RowActionButton onClick={() => sheet.openEdit(row)} />,
          },
        ]}
      />

      <FormSheet
        open={sheet.open}
        onClose={sheet.close}
        title={sheet.editing ? "Modifier la personne" : "Ajouter une personne"}
        subtitle="Compte et autorisations"
        footer={
          <FormSheetFooter
            onCancel={sheet.close}
            submitLabel={saving ? "Enregistrement…" : sheet.editing ? "Enregistrer" : "Envoyer l'invitation"}
            form={PERSON_FORM_ID}
          />
        }
      >
        {sheet.open && <PersonForm key={sheet.editing?.id ?? "new"} person={sheet.editing} divisions={apiDivisions ?? []} onSave={save} />}
      </FormSheet>
    </>
  );
}
