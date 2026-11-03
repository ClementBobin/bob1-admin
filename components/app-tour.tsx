"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import {
  Tour,
  TourArrow,
  TourClose,
  TourDescription,
  TourFooter,
  TourHeader,
  TourNext,
  TourPortal,
  TourPrev,
  TourSkip,
  TourSpotlight,
  TourSpotlightRing,
  TourStep,
  TourTitle,
} from "@/components/ui/tour";
import { toast } from "sonner";

const SEEN_KEY = "bob1-tour-seen";
const COMPLETE_KEY = "bob1-tour-complete";

type TourStepConfig = {
  target: string;
  side: "top" | "right" | "bottom" | "left";
  align: "start" | "center" | "end";
  title: string;
  description: string;
  page: string;
  desktopOnly?: boolean;
};

const allSteps: TourStepConfig[] = [
  {
    target: "#tour-nav",
    side: "right",
    align: "start",
    title: "Votre menu de gestion",
    description: "Naviguez entre les matchs, les équipes, les personnes, les classements et les paramètres du club.",
    page: "/",
    desktopOnly: true,
  },
  {
    target: "#tour-search",
    side: "bottom",
    align: "start",
    title: "Recherche globale",
    description: "Retrouvez n'importe quelle page en un instant. Astuce : appuyez sur Ctrl + K depuis n'importe où.",
    page: "/",
  },
  {
    target: "#tour-bell",
    side: "bottom",
    align: "end",
    title: "Notifications",
    description: "Les alertes du club arrivent ici : convocations, feuilles de match, paiements et rappels.",
    page: "/",
  },
  {
    target: "#tour-theme",
    side: "bottom",
    align: "end",
    title: "Thème clair ou sombre",
    description: "Basculez l'apparence de l'interface : votre choix est mémorisé sur cet appareil.",
    page: "/",
  },
  {
    target: "#tour-profile",
    side: "bottom",
    align: "end",
    title: "Votre espace",
    description: "Accédez à votre profil, aux paramètres du club et relancez la visite guidée depuis ce menu.",
    page: "/",
  },
  {
    target: "#tour-kpis",
    side: "bottom",
    align: "start",
    title: "L'essentiel en un coup d'œil",
    description: "Les indicateurs clés : matchs à venir, postes non pourvus, confirmations en attente et pénalités.",
    page: "/",
  },
  {
    target: "#tour-alerts",
    side: "top",
    align: "start",
    title: "Matchs à compléter",
    description:
      "Repérez immédiatement les rencontres qui manquent de joueurs ou d'officiels, et complétez-les en un clic.",
    page: "/",
  },
  {
    target: "#tour-calendar",
    side: "left",
    align: "start",
    title: "Calendrier du club",
    description: "Visualisez les prochains matchs et événements de la semaine.",
    page: "/",
  },
  {
    target: "#tour-activity",
    side: "left",
    align: "start",
    title: "Activité récente",
    description: "Suivez les dernières actions des bénévoles et administrateurs pour ne rien manquer.",
    page: "/",
  },
  {
    target: "#tour-matches-header",
    side: "bottom",
    align: "start",
    title: "Gérer les matchs",
    description: "Créez, modifiez et suivez l'état de chaque rencontre. Les statuts indiquent ce qu'il reste à faire.",
    page: "/matches",
  },
  {
    target: "#tour-matches-filters",
    side: "bottom",
    align: "start",
    title: "Filtrer et rechercher",
    description: "Affinez la liste par division, statut ou recherchez directement une équipe.",
    page: "/matches",
  },
  {
    target: "#tour-matches-table",
    side: "top",
    align: "start",
    title: "Besoins en bénévoles",
    description:
      "Chaque ligne montre les officiels, la buvette et le covoiturage. Les jauges indiquent ce qui reste à pourvoir.",
    page: "/matches",
  },
  {
    target: '#tour-matches-table [aria-label^="Modifier le match"]',
    side: "left",
    align: "center",
    title: "Actions rapides",
    description: "Modifiez un match ou accédez à sa fiche depuis le menu d'actions.",
    page: "/matches",
  },
  {
    target: "#tour-divisions-header",
    side: "bottom",
    align: "start",
    title: "Divisions & catégories",
    description: "Structurez les différentes catégories du club.",
    page: "/divisions",
  },
  {
    target: "#tour-divisions-table",
    side: "top",
    align: "start",
    title: "Organisation",
    description: "Chaque division regroupe des équipes et définit le niveau de compétition.",
    page: "/divisions",
  },
  {
    target: "#tour-teams-header",
    side: "bottom",
    align: "start",
    title: "Équipes du club",
    description: "Gérez les équipes, leur division, leur coach et leur identité visuelle.",
    page: "/teams",
  },
  {
    target: "#tour-teams-table",
    side: "top",
    align: "start",
    title: "Effectifs",
    description: "Le nombre de joueurs est suivi par équipe pour faciliter les convocations.",
    page: "/teams",
  },
  {
    target: "#tour-venues-header",
    side: "bottom",
    align: "start",
    title: "Gymnases & lieux",
    description: "Centralisez les adresses des salles pour planifier rapidement les rencontres.",
    page: "/venues",
  },
  {
    target: "#tour-venues-table",
    side: "top",
    align: "start",
    title: "Matchs par lieu",
    description: "Visualisez le nombre de matchs à venir par gymnase.",
    page: "/venues",
  },
  {
    target: "#tour-people-header",
    side: "bottom",
    align: "start",
    title: "Annuaire des membres",
    description: "Gérez les comptes, les rôles (Parent, Staff, Admin) et le statut.",
    page: "/people",
  },
  {
    target: "#tour-people-filters",
    side: "bottom",
    align: "start",
    title: "Filtrer l'annuaire",
    description: "Trouvez un membre par nom/e-mail et filtrez par rôle ou statut.",
    page: "/people",
  },
  {
    target: "#tour-people-table",
    side: "top",
    align: "start",
    title: "Rôles cumulables",
    description: "Un même compte peut cumuler plusieurs rôles selon les responsabilités.",
    page: "/people",
  },
  {
    target: "#tour-families-header",
    side: "bottom",
    align: "start",
    title: "Foyers",
    description: "Regroupez parents et enfants par famille pour mieux suivre les inscriptions.",
    page: "/families",
  },
  {
    target: "#tour-families-table",
    side: "top",
    align: "start",
    title: "Comptes familiaux",
    description: "Le statut indique si tous les membres de la famille ont accès à leur compte.",
    page: "/families",
  },
  {
    target: "#tour-rankings-header",
    side: "bottom",
    align: "start",
    title: "Classement par engagement",
    description: "Points attribués selon les confirmations, la buvette et le covoiturage.",
    page: "/rankings",
  },
  {
    target: "#tour-rankings-tabs",
    side: "bottom",
    align: "start",
    title: "Catégories",
    description: "Basculez entre Officiels, Covoiturage et Buvette.",
    page: "/rankings",
  },
  {
    target: "#tour-rankings-table",
    side: "top",
    align: "start",
    title: "Podium & ajustements",
    description: "Le top 3 est mis en avant. Vous pouvez ajuster manuellement les points.",
    page: "/rankings",
  },
  {
    target: "#tour-rules-header",
    side: "bottom",
    align: "start",
    title: "Barème des récompenses",
    description: "Définissez les points selon le rôle et le délai de confirmation (J-15 / J-4).",
    page: "/rules",
  },
  {
    target: "#tour-rules-table",
    side: "top",
    align: "start",
    title: "Application des règles",
    description: "Les modifications ne concernent que les nouvelles confirmations.",
    page: "/rules",
  },
  {
    target: "#tour-penalties-header",
    side: "bottom",
    align: "start",
    title: "Sanctions",
    description: "Enregistrez les absences non signalées, désistements tardifs et autres manquements.",
    page: "/penalties",
  },
  {
    target: "#tour-penalties-filters",
    side: "bottom",
    align: "start",
    title: "Filtrer les sanctions",
    description: "Filtrez par motif ou par statut (Non lue / Reconnue).",
    page: "/penalties",
  },
  {
    target: "#tour-penalties-table",
    side: "top",
    align: "start",
    title: "Historique",
    description: "Chaque sanction est tracée avec son motif, ses points et son éventuelle exclusion.",
    page: "/penalties",
  },
  {
    target: "#tour-notifications-header",
    side: "bottom",
    align: "start",
    title: "Communication",
    description: "Composez et envoyez des notifications à l'ensemble du club ou à un groupe ciblé.",
    page: "/notifications",
  },
  {
    target: "#tour-notifications-form",
    side: "right",
    align: "start",
    title: "Cibler & rédiger",
    description: "Choisissez les destinataires, le type de message et personnalisez le contenu.",
    page: "/notifications",
  },
  {
    target: "#tour-notifications-preview",
    side: "left",
    align: "start",
    title: "Aperçu mobile",
    description: "Vérifiez le rendu dans l'application avant d'envoyer.",
    page: "/notifications",
  },
];

type TourContextValue = {
  startTour: () => void;
};

const AppTourContext = createContext<TourContextValue | null>(null);

export function useAppTour() {
  const context = useContext(AppTourContext);
  if (!context) throw new Error("useAppTour must be used within AppTourProvider");
  return context;
}

function getElement(selector: string) {
  if (typeof document === "undefined") return null;
  try {
    return document.querySelector(selector) as HTMLElement | null;
  } catch {
    return null;
  }
}

export function AppTourProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [isDesktop, setIsDesktop] = useState(true);
  const [resumeAfterNav, setResumeAfterNav] = useState(false);
  const autoStartedRef = useRef(false);
  const navTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const steps = useMemo(() => allSteps.filter((item) => !item.desktopOnly || isDesktop), [isDesktop]);

  const current = steps[index];

  const pageName = useMemo(() => {
    const map: Record<string, string> = {
      "/": "Accueil",
      "/matches": "Matchs",
      "/divisions": "Divisions",
      "/teams": "Équipes",
      "/venues": "Lieux",
      "/people": "Personnes",
      "/families": "Familles",
      "/rankings": "Classements",
      "/rules": "Règles",
      "/penalties": "Pénalités",
      "/notifications": "Notifications",
    };
    return map[current?.page ?? "/"] ?? current?.page ?? "/";
  }, [current]);

  const reveal = useCallback((selector: string) => {
    const el = getElement(selector);
    if (!el) return;
    try {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch {}
    window.setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 250);
  }, []);

  const ensureOnPage = useCallback(
    (nextIndex: number) => {
      const nextStep = steps[nextIndex];
      if (!nextStep) return false;
      if (pathname !== nextStep.page) {
        setOpen(false);
        setResumeAfterNav(true);
        setIndex(nextIndex);
        router.push(nextStep.page);
        return true;
      }
      return false;
    },
    [pathname, router, steps],
  );

  const startTour = useCallback(() => {
    setOpen(false);
    window.localStorage.setItem(SEEN_KEY, "1");
    setIndex(0);
    if (ensureOnPage(0)) return;
    setTimeout(() => {
      setOpen(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (steps[0]) reveal(steps[0].target);
    }, 600);
  }, [ensureOnPage, reveal, steps]);

  // Offer the full tour once on the dashboard.
  useEffect(() => {
    if (pathname !== "/" || autoStartedRef.current) return;
    if (window.localStorage.getItem(SEEN_KEY)) return;
    const timer = window.setTimeout(() => {
      autoStartedRef.current = true;
      startTour();
    }, 1400);
    return () => window.clearTimeout(timer);
  }, [pathname, startTour]);

  // When we land on the page of the active step, reveal the tour.
  useEffect(() => {
    if (!resumeAfterNav || !current) return;
    if (pathname !== current.page) return;
    if (navTimerRef.current) window.clearTimeout(navTimerRef.current);
    navTimerRef.current = window.setTimeout(() => {
      setResumeAfterNav(false);
      setOpen(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      reveal(current.target);
    }, 700);
    return () => {
      if (navTimerRef.current) window.clearTimeout(navTimerRef.current);
    };
  }, [current, pathname, resumeAfterNav, reveal]);

  const goNext = useCallback(() => {
    if (index >= steps.length - 1) {
      setOpen(false);
      window.localStorage.setItem(COMPLETE_KEY, "1");
      toast.success("Visite complète terminée. Vous connaissez tout le back-office BOB1.");
      return;
    }
    const nextIndex = index + 1;
    if (ensureOnPage(nextIndex)) return;
    setIndex(nextIndex);
    setOpen(true);
    if (steps[nextIndex]) reveal(steps[nextIndex].target);
  }, [ensureOnPage, index, reveal, steps]);

  const goPrev = useCallback(() => {
    if (index <= 0) return;
    const nextIndex = index - 1;
    if (ensureOnPage(nextIndex)) return;
    setIndex(nextIndex);
    setOpen(true);
    if (steps[nextIndex]) reveal(steps[nextIndex].target);
  }, [ensureOnPage, index, reveal, steps]);

  const skip = useCallback(() => {
    setOpen(false);
    window.localStorage.setItem(COMPLETE_KEY, "1");
    toast.info("Visite ignorée. Relancez-la depuis le menu profil ou la barre latérale.");
  }, []);

  const contextValue = useMemo(() => ({ startTour }), [startTour]);

  if (!current) return <>{children}</>;

  return (
    <AppTourContext.Provider value={contextValue}>
      {children}
      <Tour
        open={open}
        onOpenChange={(next) => setOpen(next)}
        value={index}
        onValueChange={() => {}}
        sideOffset={18}
        spotlightPadding={12}
        dismissible
        stepFooter={
          <TourFooter className="flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-soft">
              {pageName} • Étape {index + 1} / {steps.length}
            </span>
            <div className="flex flex-wrap items-center justify-end gap-1.5">
              <TourSkip variant="ghost" className="h-8 px-2.5 text-[11.5px] font-bold text-soft" onClick={skip}>
                Passer
              </TourSkip>
              <TourPrev
                variant="outline"
                size="sm"
                className="h-8 border-line px-3 text-[11.5px]"
                onClick={goPrev}
                disabled={index === 0}
              >
                Précédent
              </TourPrev>
              <TourNext size="sm" className="h-8 px-3 text-[11.5px]" onClick={goNext}>
                {index >= steps.length - 1 ? (
                  "Terminer"
                ) : (
                  <>
                    Suivant <ChevronRight className="size-3.5" />
                  </>
                )}
              </TourNext>
            </div>
          </TourFooter>
        }
      >
        <TourPortal>
          <TourSpotlight className="bg-black/55" />
          <TourSpotlightRing className="rounded-[14px]" />
          {steps.map((step) => (
            <TourStep
              key={step.target}
              target={step.target}
              side={step.side}
              align={step.align}
              className="w-[min(380px,calc(100vw-2rem))] gap-3 p-4"
            >
              <TourArrow />
              <TourClose aria-label="Fermer la visite guidée" className="text-soft hover:text-ink" />
              <TourHeader className="text-left">
                <TourTitle className="font-display text-[15px] font-extrabold">{step.title}</TourTitle>
                <TourDescription className="text-[12px] leading-relaxed">{step.description}</TourDescription>
              </TourHeader>
            </TourStep>
          ))}
        </TourPortal>
      </Tour>
    </AppTourContext.Provider>
  );
}
