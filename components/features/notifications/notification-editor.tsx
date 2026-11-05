"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, CalendarDays, Save, Send, Users, Smartphone } from "lucide-react";
import { api, errorMessage } from "@/lib/api";
import { useApiData } from "@/hooks/use-api-data";
import { useLookups } from "@/hooks/use-lookups";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Field, FieldLabel } from "@/components/ui/field";
import { GroupedSelect, type SelectChoice, type SelectGroup } from "@/components/shared/grouped-select";
import { OptionSelect } from "@/components/shared/option-select";
import { PageHeader, CardHeading } from "@/components/layout/page-header";
import { cn } from "@/lib/utils";
import type { DivisionDto, NotificationDto, TeamDto } from "@/types";

function parseType(dataJson: string | null) {
  if (!dataJson) return null;
  try {
    const type = JSON.parse(dataJson)?.type;
    return typeof type === "string" ? type : null;
  } catch {
    return null;
  }
}

/** Shared by "Nouvelle notification" and "Modifier la notification". */
export function NotificationEditor({ notificationId }: { notificationId?: string }) {
  const router = useRouter();
  const editing = Boolean(notificationId);
  const { notificationTypeNames } = useLookups();
  const [selectedType, setType] = useState("");
  const type = selectedType || notificationTypeNames[0] || "";
  const [target, setTarget] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [expiry, setExpiry] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [startup, setStartup] = useState(true);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [recipients, setRecipients] = useState<number | null>(null);
  // Drafts are now managed in the notifications list page

  const { data: apiDivisions } = useApiData<DivisionDto[]>(() => api.divisions.list(), []);
  const { data: apiTeams } = useApiData<TeamDto[]>(() => api.teams.list(), []);
  const { data: notifications, loading: loadingNotification } = useApiData<NotificationDto[]>(
    () => (editing ? api.notifications.list(200) : Promise.resolve([])),
    [editing],
  );
  const existing = editing ? notifications?.find((item) => item.id === notificationId) : undefined;

  // Prefill the form once, when the notification being edited is available.
  const prefilled = useRef(false);
  useEffect(() => {
    if (!existing || prefilled.current) return;
    prefilled.current = true;
    setType(parseType(existing.dataJson) ?? "");
    setTitle(existing.title);
    setMessage(existing.body);
    setExpiry(existing.expiresAtUtc ? existing.expiresAtUtc.slice(0, 10) : "");
    setRecurring(existing.recurring);
    setStartup(existing.startup);
  }, [existing]);

  const targetChoices: SelectChoice[] = [{ value: "Tous les membres", label: "Tous les membres" }];
  const targetGroups: SelectGroup[] = [
    {
      heading: "Divisions",
      options: (apiDivisions ?? []).map((division) => ({ value: `Division: ${division.name}`, label: division.name })),
    },
    {
      heading: "Équipes",
      options: (apiTeams ?? []).map((team) => ({ value: `Équipe: ${team.name}`, label: team.name })),
    },
  ].filter((group) => group.options.length > 0);

  const save = () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Renseignez un titre et un message.");
      return;
    }
    // Bob1-api has no update endpoint yet: keep the user on the form so nothing is lost.
    toast.info("La modification n'est pas encore disponible via l'API.");
  };

  const send = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Renseignez un titre et un message.");
      return;
    }

    let divisionId: string | null = null;
    if (target === "Tous les membres") {
      divisionId = null;
    } else if (target.startsWith("Division:")) {
      divisionId = (apiDivisions ?? []).find((division) => division.name === target.replace("Division: ", ""))?.id ?? null;
    } else if (target.startsWith("Équipe:")) {
      // Team-based: resolve to the team's division
      const team = (apiTeams ?? []).find((t) => t.name === target.replace("Équipe: ", ""));
      divisionId = team?.divisionId ?? null;
    } else {
      // Legacy: division name directly
      divisionId = (apiDivisions ?? []).find((division) => division.name === target)?.id ?? null;
    }

    setSending(true);
    try {
      const response = await api.notifications.broadcast(
        title.trim(),
        message.trim(),
        divisionId,
        expiry ? new Date(expiry).toISOString() : null,
        recurring,
        startup,
      );
      setSent(true);
      setRecipients(response.recipients);
      toast.success(`Notification envoyée à ${response.recipients} destinataire${response.recipients > 1 ? "s" : ""}.`);
    } catch (cause) {
      toast.error(errorMessage(cause));
    } finally {
      setSending(false);
    }
  };

  const activeTarget = {
        id: target,
        label: target,
        count:
          recipients !== null
            ? `${recipients} destinataire${recipients > 1 ? "s" : ""}`
            : target === "Tous les membres"
              ? "Tous les membres du club"
              : target.startsWith("Équipe:")
                ? `Membres de l'équipe ${target.replace("Équipe: ", "")}`
                : `Membres de la division ${target.replace("Division: ", "")}`,
        icon: Users,
      };
  const TargetIcon = activeTarget.icon;

  return (
    <>
      <PageHeader
        id="tour-notifications-header"
        eyebrow="Communication"
        title={editing ? "Modifier la notification" : "Notifications"}
        description={
          editing
            ? "Mettez à jour le contenu de la notification depuis le même formulaire que pour la création."
            : "Composez et envoyez des notifications push et in-app aux membres."
        }
        secondaryAction={
          editing
            ? { label: "Retour à l'historique", icon: ArrowLeft, onClick: () => router.push("/notifications") }
            : undefined
        }
      />

      {editing && !existing && !loadingNotification ? (
        <Card className="items-center gap-3 py-12 text-center shadow-soft">
          <strong className="text-[14px]">Notification introuvable</strong>
          <p className="text-[12px] text-soft">Elle a peut-être été supprimée ou n'est plus disponible.</p>
          <Button variant="outline" onClick={() => router.push("/notifications")}>
            <ArrowLeft /> Retour à l'historique
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_0.9fr]">
          <Card id="tour-notifications-form" className="gap-0 py-0 shadow-soft">
            <CardHeading
              title={editing ? "Contenu de la notification" : "Nouvelle notification"}
              subtitle={
                editing
                  ? "Modifiez le titre, le message et les options d'affichage."
                  : "Le message sera envoyé aux destinataires sélectionnés via push et in-app."
              }
            />
            <div className="grid grid-cols-1 gap-3.5 p-5 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="notifications-field-9" className="text-[11px] font-bold text-muted-foreground">
                  Type
                </FieldLabel>
                <OptionSelect
                  id="notifications-field-9"
                  value={type}
                  onValueChange={setType}
                  options={notificationTypeNames}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="notifications-field-10" className="text-[11px] font-bold text-muted-foreground">
                  Destinataires
                </FieldLabel>
                <GroupedSelect
                  id="notifications-field-10"
                  value={target}
                  onValueChange={setTarget}
                  disabled={editing}
                  choices={targetChoices}
                  groups={targetGroups}
                  placeholder="Choisir les destinataires"
                  searchPlaceholder="Rechercher une division, une équipe…"
                />
              </Field>
              <Field className="col-span-full">
                <FieldLabel htmlFor="notifications-field-11" className="text-[11px] font-bold text-muted-foreground">
                  Titre
                </FieldLabel>
                <Input id="notifications-field-11" value={title} onChange={(event) => setTitle(event.target.value)} />
              </Field>
              <Field className="col-span-full">
                <FieldLabel htmlFor="notifications-field-12" className="text-[11px] font-bold text-muted-foreground">
                  Corps du message
                </FieldLabel>
                <Textarea
                  id="notifications-field-12"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  maxLength={240}
                />
                <div className="flex justify-end text-[10px] text-soft">{message.length} / 240 caractères</div>
              </Field>
              <Field className="col-span-full">
                <FieldLabel htmlFor="notifications-field-13" className="text-[11px] font-bold text-muted-foreground">
                  Date d'expiration (optionnel)
                </FieldLabel>
                <Input
                  id="notifications-field-13"
                  type="date"
                  value={expiry}
                  onChange={(event) => setExpiry(event.target.value)}
                />
              </Field>
              <div className="col-span-full flex flex-col gap-2 border-t border-line pt-3">
                <div className="flex min-h-[64px] items-center justify-between gap-4 px-5 py-3">
                  <span className="flex flex-col">
                    <strong className="text-[12.5px]">Notification récurrente</strong>
                    <small className="mt-0.5 text-[11px] text-soft">Renvoyer selon une fréquence définie</small>
                  </span>
                  <Switch checked={recurring} onCheckedChange={setRecurring} />
                </div>
                <div className="flex min-h-[64px] items-center justify-between gap-4 px-5 py-3">
                  <span className="flex flex-col">
                    <strong className="text-[12.5px]">Afficher au démarrage</strong>
                    <small className="mt-0.5 text-[11px] text-soft">Présenter comme message prioritaire</small>
                  </span>
                  <Switch checked={startup} onCheckedChange={setStartup} />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line px-5 py-4">
              {editing ? (
                <>
                  <Button variant="ghost" onClick={() => router.push("/notifications")}>
                    Annuler
                  </Button>
                  <Button onClick={save}>
                    <Save className="mr-2 h-4 w-4" />
                    Enregistrer les modifications
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={() => void send()} disabled={sending}>
                    <Send className="mr-2 h-4 w-4" />
                    {sending ? "Envoi…" : sent ? "Envoyer à nouveau" : "Envoyer la notification"}
                  </Button>
                </>
              )}
            </div>
          </Card>

          <div className="flex flex-col gap-4">
            {!editing && (
              <Card className="gap-0 py-0 shadow-soft">
                <CardHeading title="Destinataires ciblés" subtitle="Vérifiez le périmètre avant l'envoi" />
                <div className="flex items-center gap-3 px-5 py-4">
                  <span className="grid size-10 place-items-center rounded-xl bg-mint text-mint-foreground">
                    <TargetIcon size={18} />
                  </span>
                  <span className="flex flex-1 flex-col">
                    <strong className="text-[12.5px]">{activeTarget.label}</strong>
                    <small className="mt-0.5 text-[11px] text-soft">{activeTarget.count}</small>
                  </span>
                </div>
                <div className="flex flex-col gap-2 border-t border-line px-5 py-4">
                  <span className="flex items-center gap-2 text-[11px] font-bold text-soft">
                    <Smartphone size={14} /> Canaux d'envoi
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {["Push", "In-app"].map((item) => (
                      <span
                        key={item}
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[10.5px] font-bold",
                          item === "Push" ? "bg-brand-soft text-brand" : "bg-muted text-soft",
                        )}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            <Card id="tour-notifications-preview" className="gap-0 py-0 shadow-soft">
              <CardHeading title="Aperçu mobile" subtitle="Rendu dans l'application BOB1" />
              <div className="mx-auto my-4 w-[272px]">
                <div className="overflow-hidden rounded-[32px] border-[7px] border-[#1c1815] bg-canvas shadow-float">
                  <div className="flex h-10 items-center justify-between px-4">
                    <span className="text-[10px] font-semibold">9:41</span>
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-3.5 rounded-sm bg-ink" />
                      <span className="h-1.5 w-2.5 rounded-sm bg-ink/40" />
                      <span className="h-1.5 w-1.5 rounded-sm bg-ink/25" />
                    </span>
                  </div>
                  <div className="px-3 pb-4">
                    <div className="mt-2 flex items-center gap-2">
                      <span className="grid size-8 place-items-center rounded-xl bg-green text-[9px] font-extrabold text-brand-foreground">
                        B1
                      </span>
                      <span className="flex flex-col">
                        <strong className="text-[10px] font-extrabold tracking-[0.08em]">BOB1</strong>
                        <small className="text-[8px] text-soft">Le club, ensemble</small>
                      </span>
                    </div>
                    <div className="mt-5 flex flex-col items-center text-center">
                      <span className="grid size-11 place-items-center rounded-2xl bg-brand-soft text-brand">
                        <Bell size={20} />
                      </span>
                      <span className="mt-2.5 text-[9px] font-extrabold uppercase tracking-[0.1em] text-brand">
                        {type}
                      </span>
                      <strong className="mt-1.5 font-display text-[15px] font-extrabold">{title}</strong>
                      <p className="mt-2 max-w-[210px] text-[10px] leading-relaxed text-soft">{message}</p>
                      <button className="mt-4 h-9 w-full rounded-full bg-brand text-[11px] font-bold text-brand-foreground">
                        J'ai compris
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
