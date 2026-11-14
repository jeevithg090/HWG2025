/** Pure helpers for working with events returned by the event service. */

import type { EventAttendee, EventType, TechEvent } from "./types";

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  HACKATHON: "Hackathon",
  MEETUP: "Meetup",
  WEBINAR: "Webinar",
  CONFERENCE: "Conference",
  WORKSHOP: "Workshop",
  OTHER: "Other",
};

/** Normalizes any casing ("hackathon", "Hackathon") to the service's enum value. */
export function normalizeEventType(value: string | null | undefined): EventType {
  const upper = (value ?? "").toUpperCase();
  return upper in EVENT_TYPE_LABELS ? (upper as EventType) : "OTHER";
}

export function isOnlineEvent(event: Pick<TechEvent, "venue" | "onlineLink">): boolean {
  return !!event.onlineLink && !event.venue;
}

/** Human readable location: venue, "Online", or "Location TBA". */
export function getEventLocation(event: Pick<TechEvent, "venue" | "onlineLink">): string {
  if (event.venue) return event.onlineLink ? `${event.venue} + Online` : event.venue;
  if (event.onlineLink) return "Online";
  return "Location TBA";
}

export function isUpcoming(event: Pick<TechEvent, "startDateTime">, now = Date.now()): boolean {
  const start = new Date(event.startDateTime).getTime();
  return Number.isFinite(start) && start >= now;
}

/** Remaining spots, or null when the event has no capacity limit. */
export function getSpotsLeft(
  event: Pick<TechEvent, "maxAttendees" | "currentAttendees">,
): number | null {
  if (!event.maxAttendees) return null;
  return Math.max(0, event.maxAttendees - (event.currentAttendees ?? 0));
}

export function isEventFull(event: Pick<TechEvent, "maxAttendees" | "currentAttendees">): boolean {
  return getSpotsLeft(event) === 0;
}

/** Percentage of capacity used (0-100), or 0 when unlimited. */
export function getCapacityPercent(
  event: Pick<TechEvent, "maxAttendees" | "currentAttendees">,
): number {
  if (!event.maxAttendees) return 0;
  return Math.min(100, Math.round(((event.currentAttendees ?? 0) / event.maxAttendees) * 100));
}

export function sortByStart<T extends Pick<TechEvent, "startDateTime">>(events: T[]): T[] {
  return [...events].sort(
    (a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime(),
  );
}

export interface EventFilterOptions {
  search?: string;
  type?: EventType | "all";
  location?: "all" | "online" | "in-person";
}

export function filterEvents(events: TechEvent[], options: EventFilterOptions): TechEvent[] {
  const needle = options.search?.trim().toLowerCase() ?? "";
  return events.filter((event) => {
    if (options.type && options.type !== "all" && event.eventType !== options.type) return false;
    if (options.location === "online" && !event.onlineLink) return false;
    if (options.location === "in-person" && !event.venue) return false;
    if (!needle) return true;
    return (
      event.title.toLowerCase().includes(needle) ||
      event.description.toLowerCase().includes(needle) ||
      (event.tags ?? []).some((tag) => tag.toLowerCase().includes(needle))
    );
  });
}

/** Active (non-cancelled) registrations that carry their event. */
export function activeRegistrations(registrations: EventAttendee[]): EventAttendee[] {
  return registrations.filter((registration) => registration.status !== "CANCELLED");
}

/**
 * Combines a date ("2025-03-15") and time ("09:30") entered in the given fixed
 * offset zone ("UTC-8", "UTC+5:30", "UTC+0") into an ISO-8601 UTC string.
 * Returns null for incomplete or invalid input.
 */
export function toIsoDateTime(date: string, time: string, timezone = "UTC+0"): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return null;
  const match = /^UTC([+-])(\d{1,2})(?::(\d{2}))?$/.exec(timezone.trim());
  let offset = "Z";
  if (match) {
    const [, sign, hours, minutes = "00"] = match;
    offset =
      Number(hours) === 0 && minutes === "00" ? "Z" : `${sign}${hours.padStart(2, "0")}:${minutes}`;
  }
  const parsed = new Date(`${date}T${time}:00${offset}`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

export interface EventExtraDetails {
  category?: string;
  address?: string;
  speakers?: string[];
  agenda?: string;
  requirements?: string;
  ticketPrice?: string;
  currency?: string;
  registrationDeadline?: string;
}

/**
 * The event service stores a single description; extra form fields are
 * appended as labelled sections so organizers don't lose them.
 */
export function buildEventDescription(description: string, extra: EventExtraDetails): string {
  const sections = [description.trim()];
  const facts = [
    extra.category && `Category: ${extra.category}`,
    extra.address && `Address: ${extra.address.trim()}`,
    extra.ticketPrice && `Ticket price: ${extra.ticketPrice} ${extra.currency ?? "USD"}`,
    extra.registrationDeadline && `Registration deadline: ${extra.registrationDeadline}`,
    extra.speakers?.length ? `Speakers: ${extra.speakers.join(", ")}` : "",
  ].filter(Boolean);
  if (facts.length) sections.push(facts.join("\n"));
  if (extra.agenda?.trim()) sections.push(`Agenda:\n${extra.agenda.trim()}`);
  if (extra.requirements?.trim()) sections.push(`Requirements:\n${extra.requirements.trim()}`);
  return sections.join("\n\n");
}
