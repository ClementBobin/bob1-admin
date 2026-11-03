import type { ReactNode } from "react";
import { AuthGuard } from "@/components/auth-guard";
import AppShell from "@/components/app-shell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}
