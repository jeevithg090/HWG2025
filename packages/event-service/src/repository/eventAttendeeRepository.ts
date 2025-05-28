import { Repository } from "typeorm";
import DatabaseConnection from "../database/database";
import { EventAttendee } from "../models/eventAttendee";

class EventAttendeeRepository {
  private static _instance: EventAttendeeRepository;
  private repository!: Repository<EventAttendee>;
  private initialized = false;

  public static getInstance(): EventAttendeeRepository {
    if (!EventAttendeeRepository._instance) {
      EventAttendeeRepository._instance = new EventAttendeeRepository();
    }
    return EventAttendeeRepository._instance;
  }

  private async initRepository() {
    if (!this.initialized) {
      const dataSource = await DatabaseConnection.getInstance().getDataSource();
      this.repository = dataSource.getRepository(EventAttendee);
      this.initialized = true;
    }
  }

  public async save(attendee: Partial<EventAttendee>): Promise<EventAttendee> {
    await this.initRepository();
    return this.repository.save(attendee);
  }

  public async findById(id: string): Promise<EventAttendee | null> {
    await this.initRepository();
    return this.repository.findOneBy({ id });
  }

  public async findByEventId(eventId: string): Promise<EventAttendee[]> {
    await this.initRepository();
    return this.repository.find({
      where: { eventId },
      order: { createdAt: "ASC" },
    });
  }

  public async findByUserIdAndEventId(
    userId: string,
    eventId: string
  ): Promise<EventAttendee | null> {
    await this.initRepository();
    return this.repository.findOneBy({ userId, eventId });
  }

  public async findByUserId(userId: string): Promise<EventAttendee[]> {
    await this.initRepository();
    return this.repository.find({
      where: { userId },
      relations: ["event"],
      order: { createdAt: "DESC" },
    });
  }

  public async updateStatus(
    id: string,
    status: string
  ): Promise<EventAttendee | null> {
    await this.initRepository();
    await this.repository.update(id, { status });
    return this.findById(id);
  }

  public async markAttended(
    id: string,
    hasAttended: boolean
  ): Promise<EventAttendee | null> {
    await this.initRepository();
    await this.repository.update(id, { hasAttended });
    return this.findById(id);
  }

  public async deleteById(id: string): Promise<boolean> {
    await this.initRepository();
    const result = await this.repository.delete(id);
    return result.affected !== 0;
  }
}

export default EventAttendeeRepository.getInstance();
