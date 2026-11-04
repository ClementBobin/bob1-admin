import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/auth-provider";
import { AppTourProvider } from "@/components/app-tour";

export const metadata: Metadata = {
  title: {
    default: "BOB1 · Administration",
    template: "%s · BOB1 Administration",
  },
  description:
    "Back-office du club de basket BOB1 : matchs, équipes, membres, classements et communication.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
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
