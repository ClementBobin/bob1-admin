/**
 * Runtime configuration, readable from both server and browser.
 *
 * NEXT_PUBLIC_* variables are frozen into the JavaScript at build time, so they
 * cannot be set from docker-compose. Instead, the root layout (see
 * components/runtime-env-script.tsx) reads `API_URL` from the container's
 * environment on every request and exposes it to the browser as `window.__ENV`.
 */

declare global {
  interface Window {
    __ENV?: { API_URL?: string };
  }
}

/** Base URL of Bob1-api, without trailing slash. Resolved lazily, never at import time. */
export function getApiBaseUrl(): string {
  const value =
    typeof window === "undefined" ? process.env.API_URL : window.__ENV?.API_URL;
  if (!value) {
    throw new Error("API_URL is not configured");
  }
  return value.replace(/\/+$/, "");
}
