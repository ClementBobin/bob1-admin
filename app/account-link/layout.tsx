import type { Metadata } from "next";
import type { ReactNode } from "react";

// Public page opened from a one-time link: keep it out of search engines and never leak the address as a referrer.
export const metadata: Metadata = {
  title: "Votre compte",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function AccountLinkLayout({ children }: { children: ReactNode }) {
  return children;
}
