"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, LockKeyhole, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Logo } from "@/components/logo";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { API_BASE_URL, USE_MOCK, errorMessage } from "@/lib/api";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, login, isMock } = useAuth();

  const next = searchParams.get("next") || "/";
  const [email, setEmail] = useState("admin@bob1.local");
  const [password, setPassword] = useState("Admin123!");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) router.replace(next);
  }, [user, router, next]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isMock) {
      router.replace(next);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await login(email, password);
      router.replace(next);
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
          <CardHeader className="border-b px-6 py-6">
            <span className="text-[10.5px] font-extrabold uppercase tracking-[0.12em] text-brand">
              Administration du club
            </span>
            <CardTitle
              role="heading"
              aria-level={1}
              className="mt-1 font-display text-[25px] font-extrabold leading-tight tracking-[-0.03em]"
            >
              Connexion
            </CardTitle>
            <CardDescription className="text-[12.5px] leading-relaxed">
              Connectez-vous avec votre compte BOB1 pour gérer les matchs, les familles et les classements.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 py-6">
            <form onSubmit={submit}>
              <FieldGroup className="gap-4">
                {isMock && (
                  <Alert variant="info">
                    <Sparkles />
                    <AlertTitle>Mode démonstration actif</AlertTitle>
                    <AlertDescription className="text-current opacity-90">
                      Les données affichées proviennent des fixtures locales. Aucun compte n&apos;est nécessaire.
                    </AlertDescription>
                  </Alert>
                )}

                <Field>
                  <FieldLabel htmlFor="email">Adresse e-mail</FieldLabel>
                  <InputGroup className="h-10">
                    <InputGroupAddon>
                      <Mail />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                      placeholder="vous@bob1.local"
                    />
                  </InputGroup>
                </Field>

                <Field>
                  <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
                  <InputGroup className="h-10">
                    <InputGroupAddon>
                      <LockKeyhole />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                      placeholder="••••••••"
                    />
                  </InputGroup>
                </Field>

                {error && (
                  <Alert variant="danger">
                    <AlertDescription className="text-current">{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" disabled={submitting} className="mt-1 h-10 w-full">
                  {submitting ? "Connexion…" : isMock ? "Entrer dans la démonstration" : "Se connecter"}
                  {!submitting && <ArrowRight />}
                </Button>

                {!isMock && (
                  <div className="rounded-xl bg-muted px-3.5 py-3 text-[11px] leading-relaxed text-muted-foreground">
                    <strong className="mb-1 block text-[10.5px] uppercase tracking-[0.08em]">
                      Comptes de développement
                    </strong>
                    <code className="block">admin@bob1.local / Admin123!</code>
                    <code className="block">staff@bob1.local / Staff123!</code>
                    <code className="block">parent@bob1.local / Parent123!</code>
                  </div>
                )}
              </FieldGroup>
            </form>
          </CardContent>

          <CardFooter className="gap-2 border-t px-6 py-3.5 text-[10.5px] text-muted-foreground">
            <ShieldCheck className="size-3.5 shrink-0" />
            <span className="truncate">{isMock ? "Démo locale · aucune requête réseau" : `API : ${API_BASE_URL}`}</span>
          </CardFooter>
        </Card>

        <p className="mt-4 text-center text-[10.5px] text-soft">
          BOB1 Montpellier · Administration {USE_MOCK ? "démonstration" : "sécurisée"}
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={<div className="grid min-h-screen place-items-center bg-canvas text-[12px] text-soft">Chargement…</div>}
    >
      <LoginForm />
    </Suspense>
  );
}
