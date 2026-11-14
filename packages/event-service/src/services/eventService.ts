import { AppError } from "../common/errors";
import { AttendeeStatus } from "../enums/eventTypes";
import { AuthUser, isAdmin } from "../middleware/auth";
import { Event } from "../models/event";
import { EventAttendee } from "../models/eventAttendee";
import { Repositories } from "../repository/types";
import { CreateEventInput, EventQuery, UpdateEventInput } from "../validations/eventValidation";

export interface EventList {
  events: Event[];
  pagination: { total: number; page: number; limit: number; pages: number };
}

export interface RegistrationResult {
  message: "SUCCESSFULLY_REGISTERED" | "ADDED_TO_WAITLIST";
  attendee: EventAttendee;
}

export class EventService {
  constructor(private readonly repos: Repositories) {}

  /**
   * Public listing. Drafts and deactivated events are hidden unless the
   * requester is listing their own events (or is an admin).
   */
  async list(query: EventQuery, viewer?: AuthUser): Promise<EventList> {
    const { page, limit, upcoming, ...filter } = query;
    const canSeeDrafts =
      !!viewer && (isAdmin(viewer) || (!!filter.organizerId && filter.organizerId === viewer.id));

    const [events, total] = await this.repos.events.find(
      {
        ...filter,
        isActive: canSeeDrafts ? filter.isActive : true,
        isPublished: canSeeDrafts ? filter.isPublished : true,
        from: upcoming ? new Date() : undefined,
      },
      { skip: (page - 1) * limit, take: limit },
    );
    return { events, pagination: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async get(id: string, viewer?: AuthUser): Promise<Event> {
    const event = await this.repos.events.findById(id);
    const visible =
      event && ((event.isPublished && event.isActive) || (viewer && this.canManage(viewer, event)));
    if (!event || !visible) throw AppError.notFound("EVENT_NOT_FOUND");
    return event;
  }

  async create(user: AuthUser, input: CreateEventInput): Promise<Event> {
    return this.repos.events.create({
      ...input,
      isPublished: input.isPublished ?? true,
      organizerId: user.id,
      currentAttendees: 0,
    });
  }

  async update(user: AuthUser, id: string, input: UpdateEventInput): Promise<Event> {
    const event = await this.getManaged(user, id);
    const merged = { ...event, ...input };
    if (merged.endDateTime && merged.endDateTime < merged.startDateTime) {
      throw AppError.badRequest("END_BEFORE_START");
    }
    if (merged.maxAttendees && merged.maxAttendees < event.currentAttendees) {
      throw AppError.badRequest("CAPACITY_BELOW_REGISTRATIONS");
    }
    const updated = await this.repos.events.update(id, input);
    if (!updated) throw AppError.notFound("EVENT_NOT_FOUND");
    if (input.maxAttendees !== undefined) {
      await this.promoteWaitlist(updated);
      return (await this.repos.events.findById(id)) ?? updated;
    }
    return updated;
  }

  async remove(user: AuthUser, id: string): Promise<void> {
    await this.getManaged(user, id);
    await this.repos.events.delete(id);
  }

  async register(user: AuthUser, eventId: string): Promise<RegistrationResult> {
    const event = await this.repos.events.findById(eventId);
    if (!event) throw AppError.notFound("EVENT_NOT_FOUND");
    if (!event.isActive || !event.isPublished) throw AppError.badRequest("EVENT_NOT_AVAILABLE");
    const endsAt = event.endDateTime ?? event.startDateTime;
    if (endsAt.getTime() < Date.now()) throw AppError.badRequest("EVENT_ENDED");

    const registered = await this.repos.attendees.countByStatus(eventId, AttendeeStatus.REGISTERED);
    const status =
      event.maxAttendees && registered >= event.maxAttendees
        ? AttendeeStatus.WAITLISTED
        : AttendeeStatus.REGISTERED;

    const details = { status, userEmail: user.email, userName: user.name, hasAttended: false };
    const existing = await this.repos.attendees.findOne(eventId, user.id);
    let attendee: EventAttendee | null;
    if (existing) {
      if (existing.status !== AttendeeStatus.CANCELLED) {
        throw AppError.conflict("ALREADY_REGISTERED");
      }
      // Re-registering after a cancellation reuses the existing row.
      attendee = await this.repos.attendees.update(existing.id, details);
    } else {
      attendee = await this.repos.attendees.create({ ...details, eventId, userId: user.id });
    }
    if (!attendee) throw AppError.notFound("REGISTRATION_NOT_FOUND");

    await this.syncAttendeeCount(eventId);
    return {
      message:
        status === AttendeeStatus.WAITLISTED ? "ADDED_TO_WAITLIST" : "SUCCESSFULLY_REGISTERED",
      attendee,
    };
  }

  async cancel(user: AuthUser, eventId: string): Promise<void> {
    const event = await this.repos.events.findById(eventId);
    if (!event) throw AppError.notFound("EVENT_NOT_FOUND");
    const registration = await this.repos.attendees.findOne(eventId, user.id);
    if (!registration || registration.status === AttendeeStatus.CANCELLED) {
      throw AppError.notFound("REGISTRATION_NOT_FOUND");
    }

    await this.repos.attendees.update(registration.id, { status: AttendeeStatus.CANCELLED });
    if (registration.status === AttendeeStatus.REGISTERED) {
      await this.promoteWaitlist(event);
    }
  }

  async attendees(user: AuthUser, eventId: string): Promise<EventAttendee[]> {
    await this.getManaged(user, eventId);
    return this.repos.attendees.findByEvent(eventId);
  }

  async markAttendance(
    user: AuthUser,
    attendeeId: string,
    hasAttended: boolean,
  ): Promise<EventAttendee> {
    const attendee = await this.repos.attendees.findById(attendeeId);
    if (!attendee) throw AppError.notFound("ATTENDEE_NOT_FOUND");
    await this.getManaged(user, attendee.eventId);
    if (attendee.status !== AttendeeStatus.REGISTERED) {
      throw AppError.badRequest("ATTENDEE_NOT_REGISTERED");
    }
    const updated = await this.repos.attendees.update(attendeeId, { hasAttended });
    if (!updated) throw AppError.notFound("ATTENDEE_NOT_FOUND");
    return updated;
  }

  async userRegistrations(user: AuthUser, userId: string): Promise<EventAttendee[]> {
    if (user.id !== userId && !isAdmin(user)) throw AppError.forbidden();
    return this.repos.attendees.findByUser(userId);
  }

  /** Moves waitlisted attendees into free seats (first come, first served). */
  private async promoteWaitlist(event: Event): Promise<void> {
    const registered = await this.repos.attendees.countByStatus(
      event.id,
      AttendeeStatus.REGISTERED,
    );
    const freeSeats = event.maxAttendees ? event.maxAttendees - registered : Infinity;
    if (freeSeats > 0) {
      const waitlist = await this.repos.attendees.findByEvent(event.id, AttendeeStatus.WAITLISTED);
      for (const attendee of waitlist.slice(0, freeSeats)) {
        await this.repos.attendees.update(attendee.id, { status: AttendeeStatus.REGISTERED });
      }
    }
    await this.syncAttendeeCount(event.id);
  }

  private async syncAttendeeCount(eventId: string): Promise<void> {
    const currentAttendees = await this.repos.attendees.countByStatus(
      eventId,
      AttendeeStatus.REGISTERED,
    );
    await this.repos.events.update(eventId, { currentAttendees });
  }

  private canManage(user: AuthUser, event: Event) {
    return event.organizerId === user.id || isAdmin(user);
  }

  private async getManaged(user: AuthUser, id: string): Promise<Event> {
    const event = await this.repos.events.findById(id);
    if (!event) throw AppError.notFound("EVENT_NOT_FOUND");
    if (!this.canManage(user, event)) throw AppError.forbidden("NOT_EVENT_ORGANIZER");
    return event;
  }
}
