/**
 * Pure formatting helpers shared by pages. Kept free of React so they are easy to test.
 */

import type { Amount } from "./types";

/** Converts a number or numeric string to a finite number, or null. */
export function toNumber(value: Amount | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

/** Formats an amount as US dollars without cents ("$1,500"), or a fallback. */
export function formatCurrency(
  value: Amount | null | undefined,
  fallback = "Budget not specified",
): string {
  const n = toNumber(value);
  if (n === null) return fallback;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  }).format(n);
}

/** Formats an ISO date string as e.g. "Jan 5, 2025"; returns the fallback for invalid input. */
export function formatDate(value: string | Date | null | undefined, fallback = "—"): string {
  if (!value) return fallback;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

/** Formats an ISO date string as e.g. "Jan 5, 2025, 3:00 PM". */
export function formatDateTime(value: string | Date | null | undefined, fallback = "—"): string {
  if (!value) return fallback;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Formats the time portion of a date, e.g. "3:00 PM". */
export function formatTime(value: string | Date | null | undefined, fallback = ""): string {
  if (!value) return fallback;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

/** "in_progress" -> "In progress", "HACKATHON" -> "Hackathon". */
export function humanize(value: string | null | undefined): string {
  if (!value) return "";
  const words = value.replace(/[_-]+/g, " ").trim().toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** Returns up to two uppercase initials for a name ("Ada Lovelace" -> "AL"). */
export function getInitials(name: string | null | undefined, fallback = "U"): string {
  if (!name) return fallback;
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
  return initials || fallback;
}

/** Splits a comma separated list into trimmed, non-empty, de-duplicated entries. */
export function parseList(value: string | null | undefined): string[] {
  if (!value) return [];
  const seen = new Set<string>();
  for (const item of value.split(",")) {
    const trimmed = item.trim();
    if (trimmed) seen.add(trimmed);
  }
  return Array.from(seen);
}

/** Truncates text to `max` characters, appending an ellipsis when cut. */
export function truncate(text: string | null | undefined, max: number): string {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}
