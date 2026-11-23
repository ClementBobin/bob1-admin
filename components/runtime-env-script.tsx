/**
 * Server component: copies runtime environment variables into `window.__ENV`
 * before any client code runs. Must be rendered in <head> of the root layout,
 * which also has to be dynamic (see `connection()` in app/layout.tsx), otherwise
 * the values would be frozen at build time.
 */
export function RuntimeEnvScript() {
  const env = { API_URL: process.env.API_URL ?? "" };
  // Escape "<" so a value can never close the script tag.
  const json = JSON.stringify(env).replace(/</g, "\\u003c");
  return <script dangerouslySetInnerHTML={{ __html: `window.__ENV=${json};` }} />;
}