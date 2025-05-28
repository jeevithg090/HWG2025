import { Repository } from "typeorm";
import DatabaseConnection from "../database/database";
import { Event } from "../models/event";

class EventRepository {
  private static _instance: EventRepository;
  private repository!: Repository<Event>;
  private initialized = false;

  public static getInstance(): EventRepository {
    if (!EventRepository._instance) {
      EventRepository._instance = new EventRepository();
    }
    return EventRepository._instance;
  }

  private async initRepository() {
    if (!this.initialized) {
      const dataSource = await DatabaseConnection.getInstance().getDataSource();
      this.repository = dataSource.getRepository(Event);
      this.initialized = true;
    }
  }

  public async save(event: Partial<Event>): Promise<Event> {
    await this.initRepository();
    return this.repository.save(event);
  }

  public async findById(id: string): Promise<Event | null> {
    await this.initRepository();
    return this.repository.findOne({
      where: { id },
      relations: ["attendees"],
    });
  }

  public async findAll(options: {
    isActive?: boolean;
    eventType?: string;
    isPublished?: boolean;
    skip?: number;
    take?: number;
  }): Promise<[Event[], number]> {
    await this.initRepository();
    const { isActive, eventType, isPublished, skip = 0, take = 10 } = options;

    const queryBuilder = this.repository.createQueryBuilder("event");

    if (isActive !== undefined) {
      queryBuilder.andWhere("event.isActive = :isActive", { isActive });
    }

    if (eventType) {
      queryBuilder.andWhere("event.eventType = :eventType", { eventType });
    }

    if (isPublished !== undefined) {
      queryBuilder.andWhere("event.isPublished = :isPublished", {
        isPublished,
      });
    }

    queryBuilder.orderBy("event.startDateTime", "ASC");
    queryBuilder.skip(skip);
    queryBuilder.take(take);

    return queryBuilder.getManyAndCount();
  }

  public async findByOrganizerId(organizerId: string): Promise<Event[]> {
    await this.initRepository();
    return this.repository.find({
      where: { organizerId },
      order: { startDateTime: "ASC" },
    });
  }

  public async deleteById(id: string): Promise<boolean> {
    await this.initRepository();
    const result = await this.repository.delete(id);
    return result.affected !== 0;
  }
}

export default EventRepository.getInstance();
