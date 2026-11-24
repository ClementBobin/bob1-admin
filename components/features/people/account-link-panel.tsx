"use client";

import { useState } from "react";
import { Check, Copy, KeyRound, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, errorMessage } from "@/lib/api";
import { buildAccountLinkUrl } from "@/lib/account-links";

type Kind = "password" | "email";

const KINDS: Record<Kind, { label: string; icon: typeof KeyRound; issue: (id: string) => ReturnType<typeof api.people.passwordResetLink> }> = {
  password: { label: "Lien de réinitialisation du mot de passe", icon: KeyRound, issue: (id) => api.people.passwordResetLink(id) },
  email: { label: "Lien de changement d'e-mail", icon: Mail, issue: (id) => api.people.emailChangeLink(id) },
};

/**
 * Name and email can't be edited by an admin. Instead the admin generates a one-time link (copy / paste, no email) and the
 * person sets the new password or the new email on a public page.
 */
export function AccountLinkPanel({ personId, isActive }: { personId: string; isActive: boolean }) {
  const [busy, setBusy] = useState<Kind | null>(null);
  const [issued, setIssued] = useState<{ kind: Kind; url: string; expiresAtUtc: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const generate = async (kind: Kind) => {
    setBusy(kind);
    try {
      const link = await KINDS[kind].issue(personId);
      setIssued({ kind, url: buildAccountLinkUrl(link.token), expiresAtUtc: link.expiresAtUtc });
      setCopied(false);
    } catch (cause) {
      toast.error(errorMessage(cause));
    } finally {
      setBusy(null);
    }
  };

  const copy = async () => {
    if (!issued) return;
    try {
      await navigator.clipboard.writeText(issued.url);
      setCopied(true);
      toast.success("Lien copié.");
    } catch {
      toast.error("Copie impossible : sélectionnez le lien et copiez-le manuellement.");
    }
  };

  return (
    <div className="col-span-full flex flex-col gap-2.5 rounded-xl bg-muted px-3.5 py-3">
      <span className="flex flex-col">
        <strong className="text-[12px]">Identité et accès</strong>
        <small className="mt-0.5 text-[10.5px] leading-relaxed text-soft">
          Le nom, le prénom et l'e-mail ne sont pas modifiables ici. Générez un lien à transmettre à la personne : elle
          choisira elle-même son nouveau mot de passe ou son nouvel e-mail.
        </small>
      </span>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(KINDS) as Kind[]).map((kind) => {
          const Icon = KINDS[kind].icon;
          return (
            <Button
              key={kind}
              type="button"
              variant="outline"
              size="sm"
              disabled={!isActive || busy !== null}
              onClick={() => void generate(kind)}
            >
              <Icon />
              {busy === kind ? "Génération…" : KINDS[kind].label}
            </Button>
          );
        })}
      </div>
      {!isActive && (
        <small className="text-[10.5px] text-soft">Compte désactivé : réactivez-le pour générer un lien.</small>
      )}

      {issued && (
        <div className="flex flex-col gap-1.5">
          <strong className="text-[11px]">{KINDS[issued.kind].label}</strong>
          <div className="flex gap-2">
            <Input
              readOnly
              value={issued.url}
              aria-label="Lien à transmettre"
              onFocus={(event) => event.currentTarget.select()}
              className="font-mono text-[11px]"
            />
            <Button type="button" variant="outline" size="sm" onClick={() => void copy()}>
              {copied ? <Check /> : <Copy />}
              {copied ? "Copié" : "Copier"}
            </Button>
          </div>
          <small className="text-[10.5px] leading-relaxed text-soft">
            Valable jusqu'au {new Date(issued.expiresAtUtc).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })},
            utilisable une seule fois. Il ne sera plus affiché après la fermeture de ce formulaire ; en générer un nouveau
            annule le précédent. Ne le partagez qu'avec la personne concernée.
          </small>
        </div>
      )}
    </div>
  );
}
