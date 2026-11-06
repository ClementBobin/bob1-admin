"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { Logo } from "@/components/layout/logo";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { API_BASE_URL, errorMessage } from "@/lib/api";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, login } = useAuth();

  const next = searchParams.get("next") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) router.replace(next);
  }, [user, router, next]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
              Connectez-vous avec votre compte BOB1 pour gérer les matchs, les
              familles et les classements.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 py-6">
            <form onSubmit={submit}>
              <FieldGroup className="gap-4">
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
                      placeholder="vous@exemple.fr"
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
                    <AlertDescription className="text-current">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  disabled={submitting}
                  className="mt-1 h-10 w-full"
                >
                  {submitting ? "Connexion…" : "Se connecter"}
                  {!submitting && <ArrowRight />}
                </Button>
              </FieldGroup>
            </form>
          </CardContent>

          <CardFooter className="gap-2 border-t px-6 py-3.5 text-[10.5px] text-muted-foreground">
            <ShieldCheck className="size-3.5 shrink-0" />
            <span className="truncate">{`API : ${API_BASE_URL}`}</span>
          </CardFooter>
        </Card>

        <p className="mt-4 text-center text-[10.5px] text-soft">
          BOB1 · Administration
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center bg-canvas text-[12px] text-soft">
          Chargement…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
