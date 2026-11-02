"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  Compass,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  UserRound,
  X,
} from "lucide-react";
import { adminNav } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { Avatar, Button } from "@/components/ui";
import { useToast } from "@/components/toast";
import { useAppTour } from "@/components/app-tour";

function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = adminNav.filter((item) =>
    `${item.label} ${item.href}`.toLowerCase().includes(query.trim().toLowerCase())
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (event.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    const onClickOutside = (event: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, []);

  const go = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  return (
    <div ref={wrapRef} id="tour-search" className="relative w-full min-w-0 max-w-[430px]">
      <div className="flex h-10 items-center gap-2.5 rounded-[11px] border border-line bg-canvas px-3 text-soft focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15">
        <Search size={17} className="shrink-0" aria-hidden="true" />
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && results[0]) go(results[0].href);
          }}
          placeholder="Rechercher un match, une personne, une équipe…"
          aria-label="Recherche globale"
          className="h-full w-full bg-transparent text-[12px] text-ink outline-none placeholder:text-soft"
        />
        <kbd className="hidden shrink-0 rounded border border-line bg-card px-1.5 py-0.5 text-[9px] font-medium text-soft sm:block">
          Ctrl K
        </kbd>
      </div>
      {open && (
        <div className="animate-pop absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-xl border border-line bg-card p-1.5 shadow-float">
          <span className="block px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.08em] text-soft">
            {query ? "Résultats" : "Accès rapide"}
          </span>
          {results.length === 0 && (
            <p className="px-2.5 py-3 text-[12px] text-soft">Aucune page ne correspond à « {query} ».</p>
          )}
          {results.map((item) => {
            const ItemIcon = item.icon;
            return (
              <button
                key={item.href}
                onClick={() => go(item.href)}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[12.5px] font-semibold text-ink transition hover:bg-muted"
              >
                <ItemIcon size={16} className="text-soft" />
                {item.label}
                <span className="ml-auto text-[10px] font-medium text-soft">{item.href}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SidebarContent({
  onNavigate,
  navId,
  onStartTour,
}: {
  onNavigate?: () => void;
  navId?: string;
  onStartTour?: () => void;
}) {
  const pathname = usePathname();
  return (
    <>
      <div className="px-2">
        <Logo />
      </div>
      <span className="mx-3 mb-2 mt-7 text-[10px] font-extrabold uppercase tracking-[0.1em] text-soft">
        Administration du club
      </span>
      <nav id={navId} className="flex flex-col gap-0.5" aria-label="Navigation principale">
        {adminNav.map((item) => {
          const active = pathname === item.href;
          const ItemIcon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-10 items-center gap-3 rounded-[11px] px-3 text-[12.5px] font-bold transition",
                active ? "bg-mint text-mint-foreground" : "text-soft hover:bg-muted hover:text-ink"
              )}
            >
              <ItemIcon size={18} className={active ? "text-green" : "text-soft"} aria-hidden="true" />
              <span className="truncate">{item.label}</span>
              {item.badge && (
                <b className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-danger px-1.5 text-[9px] font-bold text-white">
                  {item.badge}
                </b>
              )}
            </Link>
          );
        })}
      </nav>
      {onStartTour && (
        <button
          onClick={onStartTour}
          className="mt-3 flex h-10 items-center gap-3 rounded-[11px] border border-dashed border-line px-3 text-[12px] font-bold text-soft transition hover:border-brand/40 hover:bg-brand-soft hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <Compass size={17} aria-hidden="true" />
          Visite guidée
        </button>
      )}
      <div className="mt-auto flex items-center gap-2.5 rounded-[14px] border border-line p-2.5">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-green text-[11px] font-extrabold text-brand-foreground">
          B1
        </span>
        <span className="flex min-w-0 flex-col">
          <strong className="truncate text-[11.5px] font-bold">BOB1 Montpellier</strong>
          <small className="mt-0.5 text-[10px] text-soft">Saison 2024–2025</small>
        </span>
      </div>
    </>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const profileRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { startTour } = useAppTour();

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("bob1-theme", next);
  };

  return (
    <div className="min-h-screen bg-canvas">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-brand-foreground"
      >
        Aller au contenu
      </a>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] flex-col border-r border-line bg-card px-4 py-5 lg:flex">
        <SidebarContent navId="tour-nav" onStartTour={startTour} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="animate-fade absolute inset-0 cursor-default bg-[rgba(8,5,3,0.45)] backdrop-blur-[2px]"
            onClick={() => setMobileOpen(false)}
            aria-label="Fermer le menu"
          />
          <aside className="animate-drawer absolute inset-y-0 left-0 flex w-[min(288px,88vw)] flex-col border-r border-line bg-card px-4 py-5">
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Fermer le menu"
              className="absolute right-3 top-3 grid size-9 place-items-center rounded-lg text-soft hover:bg-muted"
            >
              <X size={18} />
            </button>
            <SidebarContent
              onNavigate={() => setMobileOpen(false)}
              onStartTour={() => {
                setMobileOpen(false);
                startTour();
              }}
            />
          </aside>
        </div>
      )}

      <div className="lg:pl-[264px]">
        <header className="sticky top-0 z-30 flex h-[70px] items-center gap-2.5 border-b border-line bg-card/95 px-4 backdrop-blur sm:gap-3 lg:px-8">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Ouvrir le menu"
            className="grid size-10 shrink-0 place-items-center rounded-xl border border-line text-ink transition hover:bg-muted lg:hidden"
          >
            <Menu size={19} />
          </button>
          <GlobalSearch />
          <div className="ml-auto flex items-center gap-2">
            <button
              id="tour-theme"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Activer le thème clair" : "Activer le thème sombre"}
              className="grid size-10 place-items-center rounded-xl border border-line bg-card text-ink transition hover:bg-muted"
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <Link
              id="tour-bell"
              href="/notifications"
              aria-label="Ouvrir les notifications"
              className="relative grid size-10 place-items-center rounded-xl border border-line bg-card text-ink transition hover:bg-muted"
            >
              <Bell size={17} />
              <i className="absolute right-2 top-1.5 size-2 rounded-full border-2 border-card bg-brand" />
            </Link>
            <div ref={profileRef} id="tour-profile" className="relative">
              <button
                onClick={() => setProfileOpen((current) => !current)}
                aria-expanded={profileOpen}
                aria-haspopup="menu"
                className="flex h-10 items-center gap-2.5 rounded-xl pl-1.5 pr-1.5 transition hover:bg-muted sm:border-l sm:border-line sm:pl-3.5 sm:pr-1"
              >
                <Avatar name="Camille Martin" tone="orange" size="sm" />
                <span className="hidden flex-col text-left sm:flex">
                  <strong className="text-[11px] font-bold leading-tight">Camille Martin</strong>
                  <small className="mt-0.5 text-[9.5px] text-soft">Administratrice</small>
                </span>
                <ChevronDown size={15} className="hidden text-soft sm:block" />
              </button>
              {profileOpen && (
                <div
                  role="menu"
                  className="animate-pop absolute right-0 top-[calc(100%+8px)] w-60 overflow-hidden rounded-xl border border-line bg-card p-1.5 shadow-float"
                >
                  <div className="px-3 py-2.5">
                    <strong className="block text-[12.5px]">Camille Martin</strong>
                    <span className="text-[11px] text-soft">camille@email.fr</span>
                  </div>
                  <div className="my-1 h-px bg-line" />
                  <Link
                    href="/people"
                    role="menuitem"
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[12px] font-semibold transition hover:bg-muted"
                  >
                    <UserRound size={15} className="text-soft" /> Mon profil
                  </Link>
                  <Link
                    href="/rules"
                    role="menuitem"
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[12px] font-semibold transition hover:bg-muted"
                  >
                    <Settings size={15} className="text-soft" /> Paramètres du club
                  </Link>
                  <button
                    role="menuitem"
                    onClick={() => {
                      setProfileOpen(false);
                      startTour();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[12px] font-semibold text-ink transition hover:bg-muted"
                  >
                    <Compass size={15} className="text-soft" /> Visite guidée
                  </button>
                  <div className="my-1 h-px bg-line" />
                  <button
                    role="menuitem"
                    onClick={() => {
                      setProfileOpen(false);
                      toast("Mode démonstration : la déconnexion est simulée.", "info");
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[12px] font-semibold text-danger transition hover:bg-danger-soft"
                  >
                    <LogOut size={15} /> Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main id="contenu" className="mx-auto w-full max-w-[1480px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
