import { dataSource } from "../database/database";
import { Event } from "../models/event";
import { EventAttendee } from "../models/eventAttendee";
import { AttendeeRepository, EventRepository, Repositories } from "./types";

const events = () => dataSource.getRepository(Event);
const attendees = () => dataSource.getRepository(EventAttendee);

const eventRepository: EventRepository = {
  find(filter, page) {
    const qb = events().createQueryBuilder("event").orderBy("event.startDateTime", "ASC");
    if (filter.isActive !== undefined) {
      qb.andWhere("event.isActive = :isActive", { isActive: filter.isActive });
    }
    if (filter.isPublished !== undefined) {
      qb.andWhere("event.isPublished = :isPublished", { isPublished: filter.isPublished });
    }
    if (filter.eventType) {
      qb.andWhere("event.eventType = :eventType", { eventType: filter.eventType });
    }
    if (filter.organizerId) {
      qb.andWhere("event.organizerId = :organizerId", { organizerId: filter.organizerId });
    }
    if (filter.from) {
      qb.andWhere("event.startDateTime >= :from", { from: filter.from });
    }
    return qb.skip(page.skip).take(page.take).getManyAndCount();
  },
  findById(id) {
    return events().findOneBy({ id });
  },
  create(data) {
    return events().save(events().create(data));
  },
  async update(id, changes) {
    const event = await events().findOneBy({ id });
    if (!event) return null;
    return events().save(events().merge(event, changes));
  },
  async delete(id) {
    const result = await events().delete(id);
    return (result.affected ?? 0) > 0;
  },
};

const attendeeRepository: AttendeeRepository = {
  findById(id) {
    return attendees().findOneBy({ id });
  },
  findOne(eventId, userId) {
    return attendees().findOneBy({ eventId, userId });
  },
  findByEvent(eventId, status) {
    return attendees().find({
      where: status ? { eventId, status } : { eventId },
      order: { createdAt: "ASC" },
    });
  },
  findByUser(userId) {
    return attendees().find({
      where: { userId },
      relations: { event: true },
      order: { createdAt: "DESC" },
    });
  },
  countByStatus(eventId, status) {
    return attendees().countBy({ eventId, status });
  },
  create(data) {
    return attendees().save(attendees().create(data));
  },
  async update(id, changes) {
    const attendee = await attendees().findOneBy({ id });
    if (!attendee) return null;
    return attendees().save(attendees().merge(attendee, changes));
  },
};

export const typeormRepositories: Repositories = {
  events: eventRepository,
  attendees: attendeeRepository,
};
