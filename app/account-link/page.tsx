"use client";

import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, Download, LockKeyhole, Mail, ShieldCheck, Trash2 } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { api, errorMessage } from "@/lib/api";
import { clearAccountLinkToken, downloadJson, readAccountLinkToken } from "@/lib/account-links";
import type { AccountLinkInfo } from "@/types";

const MIN_PASSWORD = 8;

type Phase = "loading" | "invalid" | "ready" | "done";

/**
 * Public page opened from a one-time link an admin gave to the person (no email involved).
 * The token is read from the URL fragment, checked with the API, then used once to set a new password or a new sign-in email,
 * to download the person's data (export), or to erase the account (the person types their full email to confirm).
 */
export default function AccountLinkPage() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [token, setToken] = useState<string | null>(null);
  const [info, setInfo] = useState<AccountLinkInfo | null>(null);

  const [value, setValue] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const found = readAccountLinkToken();
    if (!found) {
      setPhase("invalid");
      return;
    }
    setToken(found);
    api.accountLinks
      .inspect(found)
      .then((data) => {
        setInfo(data);
        setPhase("ready");
      })
      .catch(() => setPhase("invalid"));
  }, []);

  const isPassword = info?.purpose === "PasswordReset";
  const isExport = info?.purpose === "DataExport";
  const isDeletion = info?.purpose === "AccountDeletion";

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !info) return;
    setError(null);

    if (isExport) {
      setSubmitting(true);
      try {
        const data = await api.accountLinks.exportData(token);
        downloadJson(`bob1-mes-donnees-${new Date().toISOString().slice(0, 10)}.json`, data);
        clearAccountLinkToken();
        setPhase("done");
      } catch (cause) {
        setError(errorMessage(cause));
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (isDeletion) {
      if (!value.trim()) return setError("Saisissez votre adresse e-mail complète pour confirmer.");
      setSubmitting(true);
      try {
        await api.accountLinks.deleteAccount(token, value.trim());
        clearAccountLinkToken();
        setPhase("done");
      } catch (cause) {
        setError(errorMessage(cause));
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (isPassword) {
      if (value.length < MIN_PASSWORD) return setError(`Le mot de passe doit contenir au moins ${MIN_PASSWORD} caractères.`);
      if (value !== confirm) return setError("Les deux mots de passe ne sont pas identiques.");
    } else if (value.trim().toLowerCase() !== confirm.trim().toLowerCase()) {
      // No verification email is sent: a typo would lock the person out, so the address is typed twice.
      return setError("Les deux adresses e-mail ne sont pas identiques.");
    }

    setSubmitting(true);
    try {
      if (isPassword) await api.accountLinks.resetPassword(token, value);
      else await api.accountLinks.changeEmail(token, value.trim());
      clearAccountLinkToken();
      setPhase("done");
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-canvas px-4 py-10">
      <div className="w-full max-w-[420px]">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>

        <Card className="gap-0 overflow-hidden py-0">
          {phase === "loading" && (
            <CardContent className="px-6 py-10 text-center text-[12.5px] text-soft">Vérification du lien…</CardContent>
          )}

          {phase === "invalid" && (
            <>
              <CardHeader className="border-b px-6 py-6">
                <CardTitle role="heading" aria-level={1} className="font-display text-[22px] font-extrabold tracking-[-0.03em]">
                  Lien invalide
                </CardTitle>
                <CardDescription className="text-[12.5px] leading-relaxed">
                  Ce lien n'est pas valide, a expiré ou a déjà été utilisé. Demandez-en un nouveau à un administrateur du club.
                </CardDescription>
              </CardHeader>
            </>
          )}

          {phase === "done" && (
            <CardHeader className="px-6 py-8">
              <CheckCircle2 className="mb-2 size-9 text-green" />
              <CardTitle role="heading" aria-level={1} className="font-display text-[22px] font-extrabold tracking-[-0.03em]">
                {isExport ? "Données téléchargées" : isDeletion ? "Compte supprimé" : isPassword ? "Mot de passe modifié" : "Adresse e-mail modifiée"}
              </CardTitle>
              <CardDescription className="text-[12.5px] leading-relaxed">
                {isExport
                  ? "Le fichier de vos données a été enregistré sur votre appareil. Ce lien n'est plus valable : conservez le fichier en lieu sûr, il contient des informations personnelles. Vous pouvez fermer cette page."
                  : isDeletion
                    ? "Votre compte et vos données personnelles ont été supprimés. Vous avez été déconnecté(e) de vos appareils. Vous pouvez fermer cette page."
                    : (isPassword
                        ? "Votre mot de passe a été modifié. Reconnectez-vous dans l'application BOB1 avec ce nouveau mot de passe."
                        : "Votre adresse e-mail a été modifiée. Reconnectez-vous dans l'application BOB1 avec cette nouvelle adresse.") +
                      " Vous avez été déconnecté(e) de vos appareils. Vous pouvez fermer cette page."}
              </CardDescription>
            </CardHeader>
          )}

          {phase === "ready" && info && (
            <>
              <CardHeader className="border-b px-6 py-6">
                <span className="text-[10.5px] font-extrabold uppercase tracking-[0.12em] text-brand">Compte BOB1</span>
                <CardTitle role="heading" aria-level={1} className="mt-1 font-display text-[25px] font-extrabold leading-tight tracking-[-0.03em]">
                  {isExport ? "Télécharger mes données" : isDeletion ? "Supprimer mon compte" : isPassword ? "Nouveau mot de passe" : "Nouvelle adresse e-mail"}
                </CardTitle>
                <CardDescription className="text-[12.5px] leading-relaxed">
                  Bonjour {info.firstName}, ce lien concerne le compte <strong>{info.maskedEmail}</strong>.{" "}
                  {isExport
                    ? "Vous allez télécharger un fichier JSON avec toutes les données que BOB1 détient à votre sujet : compte, famille, inscriptions, covoiturages, notifications et points."
                    : isDeletion
                      ? "Votre compte et l'ensemble de vos données personnelles seront supprimés définitivement."
                      : isPassword
                        ? `Choisissez un mot de passe d'au moins ${MIN_PASSWORD} caractères.`
                        : "Saisissez l'adresse avec laquelle vous vous connecterez désormais. Vérifiez-la bien : aucun e-mail de confirmation n'est envoyé."}
                </CardDescription>
              </CardHeader>

              <CardContent className="px-6 py-6">
                <form onSubmit={submit}>
                  <FieldGroup className="gap-4">
                    {isDeletion && (
                      <>
                        <Alert variant="danger">
                          <AlertDescription className="text-current">
                            Action définitive et irréversible : vos inscriptions, covoiturages, notifications et points seront effacés, et vous
                            ne pourrez plus vous connecter. Pensez à télécharger vos données avant si vous le souhaitez.
                          </AlertDescription>
                        </Alert>
                        <Field>
                          <FieldLabel htmlFor="account-link-value">Votre adresse e-mail complète</FieldLabel>
                          <InputGroup className="h-10">
                            <InputGroupAddon>
                              <Mail />
                            </InputGroupAddon>
                            <InputGroupInput
                              id="account-link-value"
                              type="email"
                              autoComplete="off"
                              placeholder={info.maskedEmail}
                              value={value}
                              onChange={(event) => setValue(event.target.value)}
                              required
                            />
                          </InputGroup>
                        </Field>
                      </>
                    )}

                    {!isExport && !isDeletion && (
                      <>
                        <Field>
                          <FieldLabel htmlFor="account-link-value">
                            {isPassword ? "Nouveau mot de passe" : "Nouvelle adresse e-mail"}
                          </FieldLabel>
                          <InputGroup className="h-10">
                            <InputGroupAddon>{isPassword ? <LockKeyhole /> : <Mail />}</InputGroupAddon>
                            <InputGroupInput
                              id="account-link-value"
                              type={isPassword ? "password" : "email"}
                              autoComplete={isPassword ? "new-password" : "email"}
                              value={value}
                              onChange={(event) => setValue(event.target.value)}
                              required
                            />
                          </InputGroup>
                        </Field>

                        <Field>
                          <FieldLabel htmlFor="account-link-confirm">
                            {isPassword ? "Confirmer le mot de passe" : "Confirmer l'adresse e-mail"}
                          </FieldLabel>
                          <InputGroup className="h-10">
                            <InputGroupAddon>{isPassword ? <LockKeyhole /> : <Mail />}</InputGroupAddon>
                            <InputGroupInput
                              id="account-link-confirm"
                              type={isPassword ? "password" : "email"}
                              autoComplete={isPassword ? "new-password" : "off"}
                              value={confirm}
                              onChange={(event) => setConfirm(event.target.value)}
                              required
                            />
                          </InputGroup>
                        </Field>

                      </>
                    )}

                    {error && (
                      <Alert variant="danger">
                        <AlertDescription className="text-current">{error}</AlertDescription>
                      </Alert>
                    )}

                    <Button
                      type="submit"
                      variant={isDeletion ? "destructive" : "default"}
                      disabled={submitting || (isDeletion && !value.trim())}
                      className="mt-1 h-10 w-full"
                    >
                      {isExport && <Download />}
                      {isDeletion && <Trash2 />}
                      {isExport
                        ? submitting ? "Préparation…" : "Télécharger mes données"
                        : isDeletion
                          ? submitting ? "Suppression…" : "Supprimer définitivement mon compte"
                          : submitting ? "Enregistrement…" : isPassword ? "Enregistrer le mot de passe" : "Enregistrer l'adresse"}
                    </Button>
                  </FieldGroup>
                </form>
              </CardContent>

              <CardFooter className="gap-2 border-t px-6 py-3.5 text-[10.5px] text-muted-foreground">
                <ShieldCheck className="size-3.5 shrink-0" />
                <span>
                  Lien à usage unique, valable jusqu'au{" "}
                  {new Date(info.expiresAtUtc).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}.
                </span>
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
