import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { ToastProvider } from "@/components/toast";
import { AppTourProvider } from "@/components/app-tour";

export const metadata: Metadata = {
  title: {
    default: "BOB1 · Administration",
    template: "%s · BOB1 Administration",
  },
  description:
    "Back-office du club de basket BOB1 Montpellier : matchs, équipes, membres, classements et communication.",
};

const themeScript = `try{var t=localStorage.getItem("bob1-theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.classList.add("dark")}}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ToastProvider>
          <AppTourProvider>{children}</AppTourProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
