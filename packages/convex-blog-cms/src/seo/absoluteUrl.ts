import type { SiteSettingsDTO } from "./types.js";

/** Strip trailing slashes; empty input stays empty. */
export function normalizeBaseUrl(url: string): string {
  return url.replace(/\/$/, "");
}

/**
 * Absolute URL for a path using Convex site `baseUrl`, or `fallbackBase` when site base is missing.
 */
export function absoluteUrlFromSite(
  site: SiteSettingsDTO | null,
  path: string,
  fallbackBase?: string,
): string {
  const raw = (site?.baseUrl ?? "").trim();
  const fromSite = raw ? normalizeBaseUrl(raw) : "";
  const base =
    fromSite || (fallbackBase?.trim() ? normalizeBaseUrl(fallbackBase.trim()) : "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
