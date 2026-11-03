"use client";

import { useState } from "react";
import { Bell, CalendarDays, Send, Users } from "lucide-react";
import { api, errorMessage, USE_MOCK, type DivisionDto } from "@/lib/api";
import { useApiData } from "@/lib/use-api-data";
import { useToast } from "@/components/toast";
import {
  Button,
  Card,
  CardHeading,
  FormField,
  PageHeader,
  SelectInput,
  Textarea,
  TextInput,
  Toggle,
} from "@/components/ui";
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
    "Rendez-vous mercredi 28 mai à 19:00 au club-house pour préparer le tournoi de fin de saison."
  );
  const [expiry, setExpiry] = useState("2025-05-28");
  const [recurring, setRecurring] = useState(false);
  const [startup, setStartup] = useState(true);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [recipients, setRecipients] = useState<number | null>(null);
  const { toast } = useToast();

  const { data: apiDivisions } = useApiData<DivisionDto[]>(() => api.divisions.list(), []);

  const targetOptions = USE_MOCK
    ? mockTargets.map((item) => item.label)
    : ["Tous les membres", ...apiDivisions.map((division) => division.name)];

  const send = async () => {
    if (USE_MOCK) {
      setSent(true);
      toast("La notification a été envoyée aux destinataires sélectionnés.");
      return;
    }

    if (!title.trim() || !message.trim()) {
      toast("Renseignez un titre et un message.", "danger");
      return;
    }

    const divisionId =
      target === "Tous les membres"
        ? null
        : apiDivisions.find((division) => division.name === target)?.id ?? null;

    setSending(true);
    try {
      const response = await api.notifications.broadcast(title.trim(), message.trim(), divisionId);
      setSent(true);
      setRecipients(response.recipients);
      toast(
        `Notification envoyée à ${response.recipients} destinataire${response.recipients > 1 ? "s" : ""}.`
      );
    } catch (cause) {
      toast(errorMessage(cause), "danger");
    } finally {
      setSending(false);
    }
  };

  const activeTarget = USE_MOCK
    ? mockTargets.find((item) => item.label === target) ?? mockTargets[0]
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
        description="Composez et programmez les messages envoyés aux membres."
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_0.9fr]">
        <Card id="tour-notifications-form">
          <CardHeading
            title="Nouvelle notification"
            subtitle="Le message sera envoyé aux destinataires sélectionnés."
          />
          <div className="grid grid-cols-1 gap-3.5 p-5 sm:grid-cols-2">
            <FormField label="Type">
              <SelectInput value={type} onChange={(event) => setType(event.target.value)} options={["Général", "Match", "Urgent", "Pénalité"]} />
            </FormField>
            <FormField label="Destinataires">
              <SelectInput value={target} onChange={(event) => setTarget(event.target.value)} options={targetOptions} />
            </FormField>
            <FormField label="Titre" wide>
              <TextInput value={title} onChange={(event) => setTitle(event.target.value)} />
            </FormField>
            <FormField label="Corps du message" wide>
              <Textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                maxLength={240}
              />
              <div className="flex justify-end text-[10px] text-soft">{message.length} / 240 caractères</div>
            </FormField>
            {USE_MOCK && (
              <FormField label="Date d'expiration" wide>
                <TextInput type="date" value={expiry} onChange={(event) => setExpiry(event.target.value)} />
              </FormField>
            )}
          </div>

          {USE_MOCK ? (
            <div className="border-t border-line">
              {[
                { label: "Notification récurrente", desc: "Renvoyer selon une fréquence définie", checked: recurring, onChange: setRecurring },
                { label: "Afficher au démarrage", desc: "Présenter comme message prioritaire", checked: startup, onChange: setStartup },
              ].map((item) => (
                <div key={item.label} className="flex min-h-[64px] items-center justify-between gap-4 px-5 py-3">
                  <span className="flex flex-col">
                    <strong className="text-[12.5px]">{item.label}</strong>
                    <small className="mt-0.5 text-[11px] text-soft">{item.desc}</small>
                  </span>
                  <Toggle checked={item.checked} onChange={item.onChange} label={item.label} />
                </div>
              ))}
            </div>
          ) : (
            <p className="border-t border-line px-5 py-3.5 text-[11px] leading-relaxed text-soft">
              L&apos;envoi est immédiat. Les options d&apos;expiration, de récurrence et d&apos;affichage au démarrage
              ne sont pas encore exposées par l&apos;API.
            </p>
          )}

          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line px-5 py-4">
            {USE_MOCK && (
              <Button
                variant="outline"
                icon={CalendarDays}
                onClick={() => toast("Le brouillon de notification a été enregistré.", "info")}
              >
                Enregistrer le brouillon
              </Button>
            )}
            <Button icon={Send} onClick={() => void send()} disabled={sending}>
              {sending ? "Envoi…" : sent ? "Envoyer à nouveau" : "Envoyer la notification"}
            </Button>
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
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
                <Bell size={14} /> Canal d&apos;envoi
              </span>
              <div className="flex flex-wrap gap-2">
                {["Push", "E-mail"].map((item) => (
                  <span
                    key={item}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[10.5px] font-bold",
                      item === "Push" ? "bg-brand-soft text-brand" : "bg-muted text-soft"
                    )}
                  >
                    {item}
                  </span>
                ))}
              </div>
              {!USE_MOCK && (
                <small className="text-[10.5px] leading-relaxed text-soft">
                  Les notifications sont diffusées dans l&apos;application et par push. L&apos;e-mail n&apos;est pas
                  encore branché.
                </small>
              )}
            </div>
          </Card>

          <Card id="tour-notifications-preview">
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
                      J&apos;ai compris
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
