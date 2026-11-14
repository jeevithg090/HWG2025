import { AttendeeStatus, EventTypes } from "../enums/eventTypes";
import { Event } from "../models/event";
import { EventAttendee } from "../models/eventAttendee";

export interface Page {
  skip: number;
  take: number;
}

export interface EventFilter {
  isActive?: boolean;
  isPublished?: boolean;
  eventType?: EventTypes;
  organizerId?: string;
  /** Only events starting at or after this instant. */
  from?: Date;
}

export interface EventRepository {
  find(filter: EventFilter, page: Page): Promise<[Event[], number]>;
  findById(id: string): Promise<Event | null>;
  create(data: Partial<Event>): Promise<Event>;
  update(id: string, changes: Partial<Event>): Promise<Event | null>;
  delete(id: string): Promise<boolean>;
}

export interface AttendeeRepository {
  findById(id: string): Promise<EventAttendee | null>;
  findOne(eventId: string, userId: string): Promise<EventAttendee | null>;
  /** Attendees of an event, oldest registration first. */
  findByEvent(eventId: string, status?: AttendeeStatus): Promise<EventAttendee[]>;
  /** A user's registrations, newest first, with the event loaded. */
  findByUser(userId: string): Promise<EventAttendee[]>;
  countByStatus(eventId: string, status: AttendeeStatus): Promise<number>;
  create(data: Partial<EventAttendee>): Promise<EventAttendee>;
  update(id: string, changes: Partial<EventAttendee>): Promise<EventAttendee | null>;
}

export interface Repositories {
  events: EventRepository;
  attendees: AttendeeRepository;
}
