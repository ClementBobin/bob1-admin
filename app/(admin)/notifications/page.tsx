"use client";

import { useState } from "react";
import { Bell, CalendarDays, Send, Users, Smartphone } from "lucide-react";
import { api, errorMessage, USE_MOCK, type DivisionDto } from "@/lib/api";
import { useApiData } from "@/lib/use-api-data";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { OptionSelect } from "@/components/option-select";
import { PageHeader, CardHeading } from "@/components/page-header";
import { cn } from "@/lib/utils";

const mockTargets = [
  { id: "all", label: "Tous les membres", count: "184 destinataires", icon: Users },
  { id: "division", label: "U13 Masculins", count: "26 destinataires", icon: Users },
  { id: "match", label: "BOB1 vs Castelnau", count: "12 officiels concernés", icon: CalendarDays },
];

export default function NotificationsPage() {
  const [type, setType] = useState("Général");
  const [target, setTarget] = useState("Tous les membres");
  const [title, setTitle] = useState("Réunion des bénévoles");
  const [message, setMessage] = useState(
    "Rendez-vous mercredi 28 mai à 19:00 au club-house pour préparer le tournoi de fin de saison.",
  );
  const [expiry, setExpiry] = useState("2025-05-28");
  const [recurring, setRecurring] = useState(false);
  const [startup, setStartup] = useState(true);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [recipients, setRecipients] = useState<number | null>(null);

  const { data: apiDivisions } = useApiData<DivisionDto[]>(() => api.divisions.list(), []);

  const targetOptions = USE_MOCK
    ? mockTargets.map((item) => item.label)
    : ["Tous les membres", ...apiDivisions.map((division) => division.name)];

  const send = async () => {
    if (USE_MOCK) {
      setSent(true);
      toast.success("La notification a été envoyée aux destinataires sélectionnés.");
      return;
    }

    if (!title.trim() || !message.trim()) {
      toast.error("Renseignez un titre et un message.");
      return;
    }

    const divisionId =
      target === "Tous les membres" ? null : (apiDivisions.find((division) => division.name === target)?.id ?? null);

    setSending(true);
    try {
      const response = await api.notifications.broadcast(title.trim(), message.trim(), divisionId);
      setSent(true);
      setRecipients(response.recipients);
      toast.success(`Notification envoyée à ${response.recipients} destinataire${response.recipients > 1 ? "s" : ""}.`);
    } catch (cause) {
      toast.error(errorMessage(cause));
    } finally {
      setSending(false);
    }
  };

  const activeTarget = USE_MOCK
    ? (mockTargets.find((item) => item.label === target) ?? mockTargets[0])
    : {
        id: target,
        label: target,
        count:
          recipients !== null
            ? `${recipients} destinataire${recipients > 1 ? "s" : ""}`
            : target === "Tous les membres"
              ? "Tous les membres du club"
              : `Membres de la division ${target}`,
        icon: Users,
      };
  const TargetIcon = activeTarget.icon;

  return (
    <>
      <PageHeader
        id="tour-notifications-header"
        eyebrow="Communication"
        title="Notifications"
        description="Composez et envoyez des notifications push et in-app aux membres."
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_0.9fr]">
        <Card id="tour-notifications-form" className="gap-0 py-0 shadow-soft">
          <CardHeading
            title="Nouvelle notification"
            subtitle="Le message sera envoyé aux destinataires sélectionnés via push et in-app."
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
                options={["Général", "Match", "Urgent", "Pénalité"]}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="notifications-field-10" className="text-[11px] font-bold text-muted-foreground">
                Destinataires
              </FieldLabel>
              <OptionSelect
                id="notifications-field-10"
                value={target}
                onValueChange={setTarget}
                options={targetOptions}
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
            {USE_MOCK && (
              <Field className="col-span-full">
                <FieldLabel htmlFor="notifications-field-13" className="text-[11px] font-bold text-muted-foreground">
                  Date d'expiration
                </FieldLabel>
                <Input
                  id="notifications-field-13"
                  type="date"
                  value={expiry}
                  onChange={(event) => setExpiry(event.target.value)}
                />
              </Field>
            )}
          </div>

          {USE_MOCK ? (
            <div className="border-t border-line">
              {[
                {
                  label: "Notification récurrente",
                  desc: "Renvoyer selon une fréquence définie",
                  checked: recurring,
                  onChange: setRecurring,
                },
                {
                  label: "Afficher au démarrage",
                  desc: "Présenter comme message prioritaire",
                  checked: startup,
                  onChange: setStartup,
                },
              ].map((item) => (
                <div key={item.label} className="flex min-h-[64px] items-center justify-between gap-4 px-5 py-3">
                  <span className="flex flex-col">
                    <strong className="text-[12.5px]">{item.label}</strong>
                    <small className="mt-0.5 text-[11px] text-soft">{item.desc}</small>
                  </span>
                  <Switch checked={item.checked} onCheckedChange={item.onChange} />
                </div>
              ))}
            </div>
          ) : (
            <p className="border-t border-line px-5 py-3.5 text-[11px] leading-relaxed text-soft">
              L'envoi est immédiat via push et in-app. Les options d'expiration, de récurrence et d'affichage au
              démarrage ne sont pas encore exposées par l'API.
            </p>
          )}

          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line px-5 py-4">
            {USE_MOCK && (
              <Button variant="outline" onClick={() => toast.info("Le brouillon de notification a été enregistré.")}>
                <CalendarDays className="mr-2 h-4 w-4" />
                Enregistrer le brouillon
              </Button>
            )}
            <Button onClick={() => void send()} disabled={sending}>
              <Send className="mr-2 h-4 w-4" />
              {sending ? "Envoi…" : sent ? "Envoyer à nouveau" : "Envoyer la notification"}
            </Button>
          </div>
        </Card>

        <div className="flex flex-col gap-4">
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
              {!USE_MOCK && (
                <small className="text-[10.5px] leading-relaxed text-soft">
                  Les notifications sont diffusées dans l'application et par push. L'e-mail n'est pas utilisé.
                </small>
              )}
            </div>
          </Card>

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
    </>
  );
}
