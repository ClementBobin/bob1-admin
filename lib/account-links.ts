/**
 * One-time account links (password reset / email change / data export / account deletion) an admin copies to a person.
 * The token lives in the URL *fragment*: it is never sent to a server, so it stays out of access logs and Referer headers.
 */
export const ACCOUNT_LINK_PATH = "/account-link";

export function buildAccountLinkUrl(token: string): string {
  return `${window.location.origin}${ACCOUNT_LINK_PATH}#token=${encodeURIComponent(token)}`;
}

export function readAccountLinkToken(): string | null {
  const token = new URLSearchParams(window.location.hash.replace(/^#/, "")).get("token");
  return token && token.trim() ? token.trim() : null;
}

/** Saves a JSON document as a file in the browser (the export is built by the API, nothing is kept here). */
export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

/** Drops the token from the address bar once it has been used. */
export function clearAccountLinkToken() {
  window.history.replaceState(null, "", window.location.pathname);
}
