import { describe, expect, it } from "vitest";
import {
  buildEventDescription,
  filterEvents,
  getCapacityPercent,
  getEventLocation,
  getSpotsLeft,
  isEventFull,
  isUpcoming,
  normalizeEventType,
  sortByStart,
  toIsoDateTime,
} from "@/lib/event-helpers";
import { buildGigDescription } from "@/lib/gig-form";
import type { TechEvent } from "@/lib/types";

const event = (overrides: Partial<TechEvent>): TechEvent => ({
  id: "e",
  title: "React Meetup",
  description: "Talks about hooks",
  startDateTime: "2030-01-01T18:00:00Z",
  eventType: "MEETUP",
  ...overrides,
});

describe("event helpers", () => {
  it("normalizes event types", () => {
    expect(normalizeEventType("hackathon")).toBe("HACKATHON");
    expect(normalizeEventType("bootcamp")).toBe("OTHER");
    expect(normalizeEventType(undefined)).toBe("OTHER");
  });

  it("describes locations", () => {
    expect(getEventLocation({ venue: "Hall A" })).toBe("Hall A");
    expect(getEventLocation({ onlineLink: "https://x" })).toBe("Online");
    expect(getEventLocation({ venue: "Hall A", onlineLink: "https://x" })).toBe("Hall A + Online");
    expect(getEventLocation({})).toBe("Location TBA");
  });

  it("computes capacity", () => {
    expect(getSpotsLeft({ maxAttendees: 10, currentAttendees: 4 })).toBe(6);
    expect(getSpotsLeft({ maxAttendees: null, currentAttendees: 4 })).toBeNull();
    expect(isEventFull({ maxAttendees: 2, currentAttendees: 3 })).toBe(true);
    expect(getCapacityPercent({ maxAttendees: 4, currentAttendees: 1 })).toBe(25);
    expect(getCapacityPercent({ maxAttendees: 0 })).toBe(0);
  });

  it("checks upcoming and sorts by start", () => {
    const now = Date.parse("2025-06-01T00:00:00Z");
    expect(isUpcoming({ startDateTime: "2025-07-01T00:00:00Z" }, now)).toBe(true);
    expect(isUpcoming({ startDateTime: "2025-05-01T00:00:00Z" }, now)).toBe(false);
    expect(isUpcoming({ startDateTime: "garbage" }, now)).toBe(false);
    const sorted = sortByStart([
      event({ id: "b", startDateTime: "2030-02-01T00:00:00Z" }),
      event({ id: "a", startDateTime: "2030-01-01T00:00:00Z" }),
    ]);
    expect(sorted.map((e) => e.id)).toEqual(["a", "b"]);
  });

  it("filters events by search, type and location", () => {
    const events = [
      event({ id: "1", tags: ["frontend"], venue: "Hall" }),
      event({ id: "2", title: "AI Hackathon", eventType: "HACKATHON", onlineLink: "https://x" }),
    ];
    expect(filterEvents(events, { search: "FRONTEND" }).map((e) => e.id)).toEqual(["1"]);
    expect(filterEvents(events, { type: "HACKATHON" }).map((e) => e.id)).toEqual(["2"]);
    expect(filterEvents(events, { location: "online" }).map((e) => e.id)).toEqual(["2"]);
    expect(filterEvents(events, { location: "in-person" }).map((e) => e.id)).toEqual(["1"]);
    expect(filterEvents(events, { type: "all" })).toHaveLength(2);
  });

  it("converts local date/time in a fixed offset to UTC ISO", () => {
    expect(toIsoDateTime("2025-03-15", "09:30", "UTC-8")).toBe("2025-03-15T17:30:00.000Z");
    expect(toIsoDateTime("2025-03-15", "09:30", "UTC+0")).toBe("2025-03-15T09:30:00.000Z");
    expect(toIsoDateTime("2025-03-15", "09:30", "UTC+5:30")).toBe("2025-03-15T04:00:00.000Z");
    expect(toIsoDateTime("", "09:30")).toBeNull();
    expect(toIsoDateTime("2025-13-40", "09:30")).toBeNull();
  });

  it("builds descriptions that keep extra form details", () => {
    expect(buildEventDescription("  Main text ", {})).toBe("Main text");
    const text = buildEventDescription("Main", {
      category: "AI",
      speakers: ["Ada", "Grace"],
      agenda: "9am intro",
    });
    expect(text).toBe("Main\n\nCategory: AI\nSpeakers: Ada, Grace\n\nAgenda:\n9am intro");

    const gigText = buildGigDescription({
      title: "t",
      description: "Build an app for us please",
      category: "web-development",
      budget: "100",
      budgetType: "hourly",
      duration: "1-week",
      deadline: "",
      experienceLevel: "expert",
      projectLocation: "",
      isRemote: true,
      requirements: "",
      deliverables: "Source code",
    });
    expect(gigText).toContain("Category: Web Development");
    expect(gigText).toContain("Budget type: Hourly rate");
    expect(gigText).toContain("Location: Remote");
    expect(gigText).toContain("Deliverables:\nSource code");
  });
});
