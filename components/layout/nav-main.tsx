"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { adminNavGroups } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import type { NavGroup, NavItem } from "@/types";

const activeColors = "data-[active=true]:bg-mint data-[active=true]:text-mint-foreground";

const allHrefs = adminNavGroups.flatMap((group) => group.items.map((item) => item.href));

/** The most specific nav href matching the path wins, so "/notifications/create" doesn't also light up "/notifications". */
function activeHref(pathname: string) {
  return allHrefs
    .filter((href) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`)))
    .sort((a, b) => b.length - a.length)[0];
}

function isActive(pathname: string, href: string) {
  return activeHref(pathname) === href;
}

/** A group with a single page is rendered as a plain link, without a chevron. */
function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const { setOpenMobile } = useSidebar();
  const active = isActive(pathname, item.href);
  const Icon = item.icon;
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={active}
        className={cn("h-10 gap-3 rounded-[11px] px-3 text-[12.5px] font-bold text-muted-foreground", activeColors)}
      >
        <Link href={item.href} onClick={() => setOpenMobile(false)} aria-current={active ? "page" : undefined}>
          <Icon className={active ? "text-green" : undefined} />
          <span className="truncate">{item.label}</span>
        </Link>
      </SidebarMenuButton>
      {item.badge && (
        <SidebarMenuBadge className="rounded-full bg-danger px-1.5 text-[9px] font-bold text-white">
          {item.badge}
        </SidebarMenuBadge>
      )}
    </SidebarMenuItem>
  );
}

/** Collapsible parent. Opens by itself when the current page belongs to it. */
function NavCollapsible({ group, pathname }: { group: NavGroup; pathname: string }) {
  const { setOpenMobile } = useSidebar();
  const hasActive = group.items.some((item) => isActive(pathname, item.href));
  const [open, setOpen] = useState(hasActive);
  const Icon = group.icon;

  // Navigating (link, search palette, tour…) to a page inside a closed group opens it.
  useEffect(() => {
    if (hasActive) setOpen(true);
  }, [hasActive, pathname]);

  return (
    <Collapsible open={open} onOpenChange={setOpen} asChild className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            className={cn(
              "h-10 gap-3 rounded-[11px] px-3 text-[12.5px] font-bold text-muted-foreground",
              hasActive && "text-foreground",
            )}
          >
            <Icon className={hasActive ? "text-green" : undefined} />
            <span className="truncate">{group.label}</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
          <SidebarMenuSub className="mx-5 mt-1 gap-0.5 pb-1">
            {group.items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <SidebarMenuSubItem key={item.href}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={active}
                    className={cn("h-8 text-[12.5px] font-semibold text-muted-foreground", activeColors)}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setOpenMobile(false)}
                      aria-current={active ? "page" : undefined}
                    >
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

export function NavMain() {
  const pathname = usePathname();
  return (
    <SidebarGroup id="tour-nav">
      <SidebarGroupContent>
        <SidebarMenu aria-label="Navigation principale">
          {adminNavGroups.map((group) =>
            group.items.length === 1 ? (
              <NavLink key={group.label} item={group.items[0]} pathname={pathname} />
            ) : (
              <NavCollapsible key={group.label} group={group} pathname={pathname} />
            ),
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
