"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Logo } from "@/components/logo";

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading || user) return;
    const next = pathname && pathname !== "/" ? `?next=${encodeURIComponent(pathname)}` : "";
    router.replace(`/login${next}`);
  }, [loading, user, router, pathname]);

  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-canvas">
        <div className="flex flex-col items-center gap-4">
          <Logo />
          <span className="text-[12px] text-soft">Chargement de la session…</span>
        </div>
      </div>
    );
  }

  // Only Admin role can access the admin app
  const isAdmin = user.roles.includes("Admin");
  if (!isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-canvas">
        <div className="flex flex-col items-center gap-4 text-center">
          <Logo />
          <h2 className="text-[18px] font-bold">Accès refusé</h2>
          <p className="text-soft max-w-xs">Cette interface est réservée aux administrateurs.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
