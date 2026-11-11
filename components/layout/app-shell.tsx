"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Bell, Compass, LogOut, Moon, Plus, Search, Settings, Sun, UserRound } from "lucide-react";
import { adminNav } from "@/lib/nav";
import { NavMain } from "@/components/layout/nav-main";
import { Logo } from "@/components/layout/logo";
import { InitialsAvatar } from "@/components/shared/initials-avatar";
import { useAppTour } from "@/components/tour/app-tour";
import { displayName, primaryRole, useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Kbd } from "@/components/ui/kbd";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { SeasonProvider } from "@/components/season/season-provider";
import { SeasonSelect } from "@/components/season/season-select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <>
      <Button
        id="tour-search"
        variant="outline"
        onClick={() => setOpen(true)}
        aria-label="Recherche globale"
        className="h-10 w-full min-w-0 max-w-[430px] justify-start gap-2.5 rounded-[11px] bg-canvas px-3 text-[12px] font-normal text-muted-foreground shadow-none"
      >
        <Search className="size-[17px]" />
        <span className="truncate">Rechercher une page, un match, une équipe…</span>
        <Kbd className="ml-auto hidden sm:inline-flex">Ctrl K</Kbd>
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Recherche globale"
        description="Aller à une page de l'administration"
      >
        <CommandInput placeholder="Rechercher une page…" />
        <CommandList>
          <CommandEmpty>Aucune page ne correspond à votre recherche.</CommandEmpty>
          <CommandGroup heading="Accès rapide">
            {adminNav.map((item) => {
              const ItemIcon = item.icon;
              return (
                <CommandItem key={item.href} value={`${item.label} ${item.href}`} onSelect={() => go(item.href)}>
                  <ItemIcon />
                  {item.label}
                  <span className="ml-auto text-[10px] text-muted-foreground">{item.href}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
          <CommandGroup heading="Actions">
            <CommandItem value="Créer un match" onSelect={() => go("/matches")}>
              <Plus />
              Créer un match
            </CommandItem>
            <CommandItem value="Ajouter des points" onSelect={() => go("/points-history")}>
              <Plus />
              Ajouter des points
            </CommandItem>
            <CommandItem value="Nouvelle notification" onSelect={() => go("/notifications/create")}>
              <Plus />
              Nouvelle notification
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

function AppSidebar() {
  const { startTour } = useAppTour();
  const { setOpenMobile } = useSidebar();
  const { user, logout } = useAuth();
  const isMock = false;
  const router = useRouter();

  const signOut = () => {
    if (isMock) {
      toast.info("Mode démonstration : la déconnexion est simulée.");
      return;
    }
    logout();
    router.replace("/login");
  };

  return (
    <Sidebar>
      <SidebarHeader className="px-4 pt-5">
        <Logo />
      </SidebarHeader>
      <SidebarContent className="px-2">
        <NavMain />
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => {
                    setOpenMobile(false);
                    startTour();
                  }}
                  className="h-10 gap-3 rounded-[11px] border border-dashed px-3 text-[12px] font-bold text-muted-foreground hover:border-brand/40 hover:bg-brand-soft hover:text-brand"
                >
                  <Compass />
                  Visite guidée
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2.5 rounded-[14px] border p-2.5">
            <InitialsAvatar name={displayName(user) || "Utilisateur"} tone="orange" size="sm" />
            <span className="flex min-w-0 flex-col">
              <strong className="truncate text-[11.5px] font-bold">{displayName(user) || "Utilisateur"}</strong>
              <small className="mt-0.5 text-[10px] text-muted-foreground">{primaryRole(user) || "Admin"}</small>
            </span>
          </div>
          <Button variant="destructive" size="sm" onClick={signOut} className="w-full justify-start gap-2.5 text-[12px] font-bold">
            <LogOut className="size-4" />
            Déconnexion
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const dark = mounted && resolvedTheme === "dark";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          id="tour-theme"
          variant="outline"
          size="icon"
          className="size-10 rounded-xl"
          onClick={() => setTheme(dark ? "light" : "dark")}
          aria-label={dark ? "Activer le thème clair" : "Activer le thème sombre"}
        >
          {dark ? <Sun /> : <Moon />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{dark ? "Thème clair" : "Thème sombre"}</TooltipContent>
    </Tooltip>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <SeasonProvider>
    <SidebarProvider style={{ "--sidebar-width": "264px" } as CSSProperties} className="bg-canvas">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-brand-foreground"
      >
        Aller au contenuile
      </a>
      <AppSidebar />
      <SidebarInset id="contenu" className="min-w-0 bg-canvas">
        <header className="sticky top-0 z-30 flex h-[70px] items-center gap-2.5 border-b bg-card/95 px-4 backdrop-blur sm:gap-3 lg:px-8">
          <SidebarTrigger className="size-10 shrink-0 rounded-xl border md:hidden" aria-label="Ouvrir le menu" />
          <GlobalSearch />
          <div className="ml-auto flex items-center gap-2">
            <SeasonSelect />
            <ThemeToggle />
            <Button id="tour-bell" variant="outline" size="icon" className="relative size-10 rounded-xl" asChild>
              <Link href="/notifications" aria-label="Ouvrir les notifications">
                <Bell />
                <i className="absolute right-2 top-1.5 size-2 rounded-full border-2 border-card bg-brand" />
              </Link>
            </Button>
          </div>
        </header>
        <div className="mx-auto w-full max-w-[1480px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
    </SeasonProvider>
  );
}
