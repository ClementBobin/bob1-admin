"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, LockKeyhole, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Logo } from "@/components/logo";
import { Button, Card, FormField, TextInput } from "@/components/ui";
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

        <Card className="overflow-hidden">
          <div className="border-b border-line px-6 py-6">
            <span className="text-[10.5px] font-extrabold uppercase tracking-[0.12em] text-brand">
              Administration du club
            </span>
            <h1 className="mt-2 font-display text-[25px] font-extrabold leading-tight tracking-[-0.03em]">
              Connexion
            </h1>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-soft">
              Connectez-vous avec votre compte BOB1 pour gérer les matchs, les familles et les classements.
            </p>
          </div>

          <form onSubmit={submit} className="flex flex-col gap-4 px-6 py-6">
            {isMock && (
              <div className="flex items-start gap-2.5 rounded-xl bg-info-soft px-3.5 py-3 text-[11.5px] leading-relaxed text-info">
                <Sparkles size={16} className="mt-0.5 shrink-0" />
                <span>
                  <strong className="block">Mode démonstration actif</strong>
                  Les données affichées proviennent des fixtures locales. Aucun compte n&apos;est nécessaire.
                </span>
              </div>
            )}

            <FormField label="Adresse e-mail">
              <span className="relative block">
                <Mail size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-soft" />
                <TextInput
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="pl-9"
                  placeholder="vous@bob1.local"
                />
              </span>
            </FormField>

            <FormField label="Mot de passe">
              <span className="relative block">
                <LockKeyhole size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-soft" />
                <TextInput
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="pl-9"
                  placeholder="••••••••"
                />
              </span>
            </FormField>

            {error && (
              <div className="rounded-xl bg-danger-soft px-3.5 py-3 text-[11.5px] font-medium leading-relaxed text-danger">
                {error}
              </div>
            )}

            <Button type="submit" disabled={submitting} className="mt-1 w-full">
              {submitting ? "Connexion…" : isMock ? "Entrer dans la démonstration" : "Se connecter"}
              {!submitting && <ArrowRight size={16} />}
            </Button>

            {!isMock && (
              <div className="rounded-xl bg-muted px-3.5 py-3 text-[11px] leading-relaxed text-soft">
                <strong className="mb-1 block text-[10.5px] uppercase tracking-[0.08em]">
                  Comptes de développement
                </strong>
                <code className="block">admin@bob1.local / Admin123!</code>
                <code className="block">staff@bob1.local / Staff123!</code>
                <code className="block">parent@bob1.local / Parent123!</code>
              </div>
            )}
          </form>

          <div className="flex items-center gap-2 border-t border-line px-6 py-3.5 text-[10.5px] text-soft">
            <ShieldCheck size={14} className="shrink-0" />
            <span className="truncate">
              {isMock ? "Démo locale · aucune requête réseau" : `API : ${API_BASE_URL}`}
            </span>
          </div>
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
    <Suspense fallback={<div className="grid min-h-screen place-items-center bg-canvas text-[12px] text-soft">Chargement…</div>}>
      <LoginForm />
    </Suspense>
  );
}
