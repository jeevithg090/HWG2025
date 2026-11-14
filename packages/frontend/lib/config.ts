/**
 * Central place for runtime configuration of backend service URLs.
 *
 * `NEXT_PUBLIC_*` variables are inlined by Next.js at build time, so they must
 * be referenced literally (no dynamic `process.env[name]` lookups).
 */

export const DEFAULT_USER_SERVICE_URL = "http://localhost:4000";
export const DEFAULT_FREELANCE_SERVICE_URL = "http://localhost:4001";
export const DEFAULT_EVENT_SERVICE_URL = "http://localhost:4002";
export const DEFAULT_SITE_URL = "http://localhost:3000";

/** Removes trailing slashes so paths can always be appended with a leading "/". */
export function normalizeBaseUrl(url: string | undefined, fallback: string): string {
  const value = url?.trim() || fallback;
  return value.replace(/\/+$/, "");
}

export const config = {
  /** Public URL of this frontend, used as `metadataBase` for absolute OG/Twitter URLs. */
  siteUrl: normalizeBaseUrl(process.env.NEXT_PUBLIC_SITE_URL, DEFAULT_SITE_URL),
  userServiceUrl: normalizeBaseUrl(
    process.env.NEXT_PUBLIC_USER_SERVICE_URL,
    DEFAULT_USER_SERVICE_URL,
  ),
  freelanceServiceUrl: normalizeBaseUrl(
    process.env.NEXT_PUBLIC_FREELANCE_SERVICE_URL,
    DEFAULT_FREELANCE_SERVICE_URL,
  ),
  eventServiceUrl: normalizeBaseUrl(
    process.env.NEXT_PUBLIC_EVENT_SERVICE_URL,
    DEFAULT_EVENT_SERVICE_URL,
  ),
} as const;

export type AppConfig = typeof config;
