import type { Metadata } from "next";
import type { ReactNode } from "react";
import { connection } from "next/server";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/auth/auth-provider";
import { AppTourProvider } from "@/components/tour/app-tour";
import { RuntimeEnvScript } from "@/components/runtime-env-script";

export const metadata: Metadata = {
  title: {
    default: "BOB1 · Administration",
    template: "%s · BOB1 Administration",
  },
  description:
    "Back-office du club de basket BOB1 : matchs, équipes, membres, classements et communication.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Render per request so the runtime API_URL is read from the container, not frozen at build.
  await connection();

  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <RuntimeEnvScript />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          storageKey="bob1-theme"
          disableTransitionOnChange
        >
          <TooltipProvider>
            <AuthProvider>
              <AppTourProvider>{children}</AppTourProvider>
            </AuthProvider>
          </TooltipProvider>
          <Toaster richColors position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}