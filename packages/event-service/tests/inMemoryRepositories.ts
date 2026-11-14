import { randomUUID } from "crypto";
import { AttendeeStatus, EventTypes } from "../src/enums/eventTypes";
import { Event } from "../src/models/event";
import { EventAttendee } from "../src/models/eventAttendee";
import { Repositories } from "../src/repository/types";

let clock = 0;
const stamp = () => new Date(Date.UTC(2025, 0, 1) + clock++ * 1000);

export const createInMemoryRepositories = () => {
  const events: Event[] = [];
  const attendees: EventAttendee[] = [];
  const copy = <T>(row: T | undefined) => (row ? { ...row } : null);

  const repos: Repositories = {
    events: {
      async find(filter, page) {
        const rows = events
          .filter(
            (e) =>
              (filter.isActive === undefined || e.isActive === filter.isActive) &&
              (filter.isPublished === undefined || e.isPublished === filter.isPublished) &&
              (!filter.eventType || e.eventType === filter.eventType) &&
              (!filter.organizerId || e.organizerId === filter.organizerId) &&
              (!filter.from || e.startDateTime >= filter.from),
          )
          .sort((a, b) => a.startDateTime.getTime() - b.startDateTime.getTime());
        return [rows.slice(page.skip, page.skip + page.take).map((e) => ({ ...e })), rows.length];
      },
      async findById(id) {
        return copy(events.find((e) => e.id === id));
      },
      async create(data) {
        const now = stamp();
        const event = {
          eventType: EventTypes.MEETUP,
          isActive: true,
          isPublished: true,
          currentAttendees: 0,
          ...data,
          id: randomUUID(),
          createdAt: now,
          updatedAt: now,
        } as Event;
        events.push(event);
        return { ...event };
      },
      async update(id, changes) {
        const event = events.find((e) => e.id === id);
        if (!event) return null;
        Object.assign(event, changes, { updatedAt: stamp() });
        return { ...event };
      },
      async delete(id) {
        const index = events.findIndex((e) => e.id === id);
        if (index < 0) return false;
        events.splice(index, 1);
        // Mirror the ON DELETE CASCADE foreign key.
        for (let i = attendees.length - 1; i >= 0; i--) {
          if (attendees[i].eventId === id) attendees.splice(i, 1);
        }
        return true;
      },
    },
    attendees: {
      async findById(id) {
        return copy(attendees.find((a) => a.id === id));
      },
      async findOne(eventId, userId) {
        return copy(attendees.find((a) => a.eventId === eventId && a.userId === userId));
      },
      async findByEvent(eventId, status) {
        return attendees
          .filter((a) => a.eventId === eventId && (!status || a.status === status))
          .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
          .map((a) => ({ ...a }));
      },
      async findByUser(userId) {
        return attendees
          .filter((a) => a.userId === userId)
          .map((a) => ({ ...a, event: copy(events.find((e) => e.id === a.eventId)) ?? undefined }))
          .reverse();
      },
      async countByStatus(eventId, status: AttendeeStatus) {
        return attendees.filter((a) => a.eventId === eventId && a.status === status).length;
      },
      async create(data) {
        const now = stamp();
        const attendee = {
          hasAttended: false,
          status: AttendeeStatus.REGISTERED,
          ...data,
          id: randomUUID(),
          createdAt: now,
          updatedAt: now,
        } as EventAttendee;
        attendees.push(attendee);
        return { ...attendee };
      },
      async update(id, changes) {
        const attendee = attendees.find((a) => a.id === id);
        if (!attendee) return null;
        Object.assign(attendee, changes, { updatedAt: stamp() });
        return { ...attendee };
      },
    },
  };
  return { repos, events, attendees };
};
