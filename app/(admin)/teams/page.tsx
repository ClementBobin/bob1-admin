"use client";

import { useEffect, useMemo, useState } from "react";
import { MoreHorizontal, Plus, Upload, Shield } from "lucide-react";
import { teams } from "@/lib/data";
import { api, errorMessage, USE_MOCK, type DivisionDto, type TeamDto } from "@/lib/api";
import { useApiData } from "@/lib/use-api-data";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { OptionSelect } from "@/components/option-select";
import { Button } from "@/components/ui/button";
import { Status } from "@/components/status";
import { DataTable } from "@/components/data-table";
import { Filters } from "@/components/filters";
import { PageHeader } from "@/components/page-header";
import { FormSheet, FormSheetFooter } from "@/components/form-sheet";

type TeamRow = {
  id: string;
  name: string;
  division: string;
  coach: string;
  logo: string | null;
  players: string;
  status: string;
  trainingLocation: string | null;
};

const initial: TeamRow[] = teams.map((item) => ({ ...item }));
const mockDivisionOptions = ["U13 M", "U13 F", "U15 M", "U15 F", "U17 M", "U17 F", "Seniors M", "Seniors F"];
const mockStatusOptions = ["Active", "Externe", "Archivée"];

function Form({
  row,
  divisionOptions,
  onSave,
}: {
  row: TeamRow | null;
  divisionOptions: string[];
  onSave: (row: TeamRow) => void;
}) {
  const [name, setName] = useState(row?.name ?? "BOB1 U18 M");
  const [division, setDivision] = useState(row?.division ?? divisionOptions[0] ?? "U17 M");
  const [coach, setCoach] = useState(row?.coach ?? "");
  const [status, setStatus] = useState(row?.status ?? "Active");
  const [logo, setLogo] = useState(row?.logo ?? "");
  const [trainingLocation, setTrainingLocation] = useState(row?.trainingLocation ?? "");
  const [logoPreview, setLogoPreview] = useState<string | null>(row?.logo ?? null);

  // Divisions load asynchronously: keep the select on a valid option.
  useEffect(() => {
    if (divisionOptions.length > 0 && !divisionOptions.includes(division)) setDivision(divisionOptions[0]);
  }, [divisionOptions, division]);

  return (
    <form
      id="team-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSave({
          id: row?.id ?? `t${Date.now()}`,
          name,
          division,
          coach: coach || "À désigner",
          logo: logoPreview,
          players: row?.players ?? "0 joueur",
          status,
          trainingLocation: trainingLocation || null,
        });
      }}
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <Field className="col-span-full">
          <FieldLabel htmlFor="teams-field-27" className="text-[11px] font-bold text-muted-foreground">
            Nom de l'équipe
          </FieldLabel>
          <Input id="teams-field-27" value={name} onChange={(event) => setName(event.target.value)} required />
        </Field>
        <Field className={!USE_MOCK ? "col-span-full" : undefined}>
          <FieldLabel htmlFor="teams-field-28" className="text-[11px] font-bold text-muted-foreground">
            Division
          </FieldLabel>
          <OptionSelect id="teams-field-28" value={division} onValueChange={setDivision} options={divisionOptions} />
        </Field>
        <Field>
          <FieldLabel htmlFor="teams-field-29" className="text-[11px] font-bold text-muted-foreground">
            Coach principal
          </FieldLabel>
          <Input
            id="teams-field-29"
            value={coach}
            onChange={(event) => setCoach(event.target.value)}
            placeholder="Nom du coach"
          />
        </Field>
        <Field className="col-span-full">
          <FieldLabel htmlFor="teams-field-30" className="text-[11px] font-bold text-muted-foreground">
            Statut
          </FieldLabel>
          <OptionSelect id="teams-field-30" value={status} onValueChange={setStatus} options={mockStatusOptions} />
        </Field>
        <Field className="col-span-full">
          <FieldLabel htmlFor="teams-field-31" className="text-[11px] font-bold text-muted-foreground">
            Lieu d'entraînement principal
          </FieldLabel>
          <Input
            id="teams-field-31"
            value={trainingLocation}
            onChange={(event) => setTrainingLocation(event.target.value)}
            placeholder="Gymnase, adresse..."
          />
        </Field>
      </div>

      <div>
        <span className="mb-1.5 block text-[11px] font-bold text-soft">Logo de l'équipe</span>
        <label className="flex min-h-[112px] cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-line px-4 text-center transition hover:bg-muted/50">
          <input
            type="file"
            accept="image/png,image/svg+xml"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (e) => setLogoPreview(e.target?.result as string);
                reader.readAsDataURL(file);
                setLogo(file.name);
              }
            }}
          />
          <span className="grid size-9 place-items-center rounded-xl bg-muted text-soft">
            <Upload size={18} />
          </span>
          <strong className="mt-1 text-[12px]">{logo || logoPreview ? "Logo chargé" : "Importer un logo"}</strong>
          <small className="text-[10px] text-soft">PNG ou SVG · 2 Mo max.</small>
        </label>
        {logoPreview && (
          <div className="relative w-[120px] h-[120px] rounded-xl border border-line bg-card overflow-hidden">
            <img src={logoPreview} alt="Aperçu du logo" className="w-full h-full object-contain" />
          </div>
        )}
      </div>
    </form>
  );
}

export default function TeamsPage() {
  const [rows, setRows] = useState<TeamRow[]>(USE_MOCK ? initial : []);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Tous les statuts");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<TeamRow | null>(null);

  const { data: apiTeams, loading, error, reload } = useApiData<TeamDto[]>(() => api.teams.list(), []);
  const { data: apiDivisions } = useApiData<DivisionDto[]>(() => api.divisions.list(), []);

  const divisionOptions = USE_MOCK ? mockDivisionOptions : apiDivisions.map((division) => division.name);

  useEffect(() => {
    if (USE_MOCK) return;
    const names = new Map(apiDivisions.map((division) => [division.id, division.name]));
    setRows(
      apiTeams.map((team) => ({
        id: team.id,
        name: team.name,
        division: names.get(team.divisionId) ?? "—",
        coach: team.coachName ?? "—",
        logo: team.logoUrl ?? null,
        players: "—",
        status: team.isActive ? "Active" : "Archivée",
        trainingLocation: team.trainingLocation ?? null,
      })),
    );
  }, [apiTeams, apiDivisions]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchSearch = `${row.name} ${row.division} ${row.coach} ${row.trainingLocation ?? ""}`
        .toLowerCase()
        .includes(needle);
      const matchStatus = status === "Tous les statuts" || row.status === status;
      return matchSearch && matchStatus;
    });
  }, [rows, search, status]);

  const openCreate = () => {
    setEditing(null);
    setDrawerOpen(true);
  };

  const openEdit = (row: TeamRow) => {
    setEditing(row);
    setDrawerOpen(true);
  };

  const save = async (row: TeamRow) => {
    if (USE_MOCK) {
      if (editing) {
        setRows((current) => current.map((item) => (item.id === row.id ? row : item)));
        toast.success("L'équipe a été mise à jour.");
      } else {
        setRows((current) => [row, ...current]);
        toast.success("L'équipe a été créée.");
      }
      setDrawerOpen(false);
      setEditing(null);
      return;
    }

    const division = apiDivisions.find((item) => item.name === row.division);
    if (!division) {
      toast.error("Sélectionnez une division existante.");
      return;
    }

    try {
      const teamData = {
        name: row.name,
        divisionId: division.id,
        coachName: row.coach === "À désigner" ? undefined : row.coach,
        logoUrl: row.logo || undefined,
        isActive: row.status === "Active",
        trainingLocation: row.trainingLocation || undefined,
      };
      if (editing) await api.teams.update(row.id, teamData);
      else await api.teams.create(teamData);
      await reload();
      toast.success(editing ? "L'équipe a été mise à jour." : "L'équipe a été créée.");
      setDrawerOpen(false);
      setEditing(null);
    } catch (cause) {
      toast.error(errorMessage(cause));
    }
  };

  return (
    <>
      <PageHeader
        id="tour-teams-header"
        eyebrow="Référentiels"
        title="Équipes"
        description="Gérez les équipes, coachs, logos et lieux d'entraînement."
        action={{ label: "Créer une équipe", icon: Plus, onClick: openCreate }}
      />

      <Filters
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Rechercher une équipe, un coach, un lieu…"
        selects={[
          {
            label: "Statut",
            value: status,
            options: ["Tous les statuts", "Active", "Externe", "Archivée"],
            onChange: setStatus,
          },
        ]}
        onReset={() => {
          setSearch("");
          setStatus("Tous les statuts");
        }}
      />

      {!USE_MOCK && error && (
        <div className="mb-4 rounded-xl bg-danger-soft px-4 py-3 text-[12px] font-medium text-danger">{error}</div>
      )}

      <DataTable
        id="tour-teams-table"
        rows={filtered}
        rowKey={(row) => row.id}
        minWidth={1000}
        grid="1.5fr 1fr 1.2fr 1fr .9fr .9fr 36px"
        emptyMessage={loading ? "Chargement des équipes…" : undefined}
        columns={[
          {
            key: "name",
            label: "Équipe",
            render: (row) => (
              <span className="flex items-center gap-2.5">
                <span className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-green text-[9px] font-extrabold text-brand-foreground">
                  {row.name
                    .split(" ")
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join("")}
                </span>
                <strong className="truncate">{row.name}</strong>
              </span>
            ),
          },
          {
            key: "division",
            label: "Division",
            render: (row) => (
              <span className="rounded-full bg-mint px-2.5 py-1 text-[10.5px] font-bold text-mint-foreground">
                {row.division}
              </span>
            ),
          },
          { key: "coach", label: "Coach", render: (row) => row.coach },
          {
            key: "logo",
            label: "Logo",
            render: (row) =>
              row.logo ? <span className="text-green">✓ Logo</span> : <span className="text-soft">—</span>,
          },
          {
            key: "trainingLocation",
            label: "Lieu d'entraînement",
            render: (row) => row.trainingLocation ?? <span className="text-soft">—</span>,
          },
          {
            key: "status",
            label: "Statut",
            render: (row) => (
              <Status tone={row.status === "Active" ? "success" : row.status === "Externe" ? "info" : "neutral"}>
                {row.status}
              </Status>
            ),
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
        title={editing ? "Modifier l'équipe" : "Créer une équipe"}
        subtitle="Identité et encadrement"
        footer={
          <FormSheetFooter
            onCancel={() => setDrawerOpen(false)}
            submitLabel={editing ? "Enregistrer" : "Créer l'équipe"}
            form="team-form"
          />
        }
      >
        {drawerOpen && (
          <Form key={editing?.id ?? "new"} row={editing} divisionOptions={divisionOptions} onSave={save} />
        )}
      </FormSheet>
    </>
  );
}
