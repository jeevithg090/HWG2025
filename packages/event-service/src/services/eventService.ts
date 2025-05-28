import { Event } from "../models/event";
import { EventAttendee } from "../models/eventAttendee";
import eventAttendeeRepository from "../repository/eventAttendeeRepository";
import eventRepository from "../repository/eventRepository";
import {
  CreateEventInput,
  RegisterEventInput,
} from "../types/createEventTypes";

export class EventService {
  public async createEvent(eventData: CreateEventInput): Promise<Event> {
    const newEvent = await eventRepository.save(eventData);
    return newEvent;
  }

  public async updateEvent(
    id: string,
    eventData: Partial<CreateEventInput>
  ): Promise<Event | null> {
    const event = await eventRepository.findById(id);
    if (!event) {
      return null;
    }

    const updatedEvent = { ...event, ...eventData };
    return eventRepository.save(updatedEvent);
  }

  public async findEventById(id: string): Promise<Event | null> {
    return eventRepository.findById(id);
  }

  public async findEvents(options: {
    isActive?: boolean;
    eventType?: string;
    isPublished?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ events: Event[]; total: number }> {
    const { page = 1, limit = 10, ...filters } = options;
    const skip = (page - 1) * limit;

    const [events, total] = await eventRepository.findAll({
      ...filters,
      skip,
      take: limit,
    });

    return { events, total };
  }

  public async findEventsByOrganizerId(organizerId: string): Promise<Event[]> {
    return eventRepository.findByOrganizerId(organizerId);
  }

  public async deleteEvent(id: string): Promise<boolean> {
    return eventRepository.deleteById(id);
  }

  // Event Attendee methods
  public async registerForEvent(
    eventId: string,
    attendeeData: RegisterEventInput
  ): Promise<{ success: boolean; message: string; attendee?: EventAttendee }> {
    const event = await eventRepository.findById(eventId);

    if (!event) {
      return { success: false, message: "EVENT_NOT_FOUND" };
    }

    if (!event.isActive || !event.isPublished) {
      return { success: false, message: "EVENT_NOT_AVAILABLE" };
    }

    const existingRegistration =
      await eventAttendeeRepository.findByUserIdAndEventId(
        attendeeData.userId,
        eventId
      );

    if (existingRegistration) {
      return { success: false, message: "ALREADY_REGISTERED" };
    }

    if (event.maxAttendees && event.currentAttendees >= event.maxAttendees) {
      // Add to waitlist
      const attendee = await eventAttendeeRepository.save({
        eventId,
        userId: attendeeData.userId,
        userEmail: attendeeData.userEmail,
        userName: attendeeData.userName,
        status: "WAITLISTED",
      });

      return {
        success: true,
        message: "ADDED_TO_WAITLIST",
        attendee,
      };
    }

    // Register user
    const attendee = await eventAttendeeRepository.save({
      eventId,
      userId: attendeeData.userId,
      userEmail: attendeeData.userEmail,
      userName: attendeeData.userName,
    });

    // Increment attendee count
    await eventRepository.save({
      id: eventId,
      currentAttendees: event.currentAttendees + 1,
    });

    return {
      success: true,
      message: "SUCCESSFULLY_REGISTERED",
      attendee,
    };
  }

  public async cancelRegistration(
    eventId: string,
    userId: string
  ): Promise<{ success: boolean; message: string }> {
    const registration = await eventAttendeeRepository.findByUserIdAndEventId(
      userId,
      eventId
    );

    if (!registration) {
      return { success: false, message: "REGISTRATION_NOT_FOUND" };
    }

    const event = await eventRepository.findById(eventId);

    if (!event) {
      return { success: false, message: "EVENT_NOT_FOUND" };
    }

    await eventAttendeeRepository.updateStatus(registration.id, "CANCELLED");

    if (registration.status === "REGISTERED") {
      await eventRepository.save({
        id: eventId,
        currentAttendees: Math.max(0, event.currentAttendees - 1),
      });

      // TODO: Implement waitlist promotion logic
    }

    return {
      success: true,
      message: "REGISTRATION_CANCELLED",
    };
  }

  public async getEventAttendees(eventId: string): Promise<EventAttendee[]> {
    return eventAttendeeRepository.findByEventId(eventId);
  }

  public async getUserEvents(userId: string): Promise<EventAttendee[]> {
    return eventAttendeeRepository.findByUserId(userId);
  }

  public async markAttendance(
    attendeeId: string,
    hasAttended: boolean
  ): Promise<EventAttendee | null> {
    return eventAttendeeRepository.markAttended(attendeeId, hasAttended);
  }
}
