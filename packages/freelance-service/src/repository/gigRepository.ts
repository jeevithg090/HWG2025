import { Repository } from "typeorm";
import { Gig } from "../models/gig";
import DatabaseConnection from "../database/database";

export class GigRepository {
  private repository: Repository<Gig>;

  constructor() {
    const dataSource = DatabaseConnection.getInstance();
    dataSource.getDataSource().then((ds) => {
      this.repository = ds.getRepository(Gig);
    });
  }

  async findAll(filter?: Partial<Gig>, skip = 0, take = 10): Promise<Gig[]> {
    // Remove array fields from filter to avoid typeorm error
    const { requiredSkills, ...restFilter } = filter || {};
    return this.repository.find({
      where: restFilter,
      skip,
      take,
      order: { createdAt: "DESC" },
      relations: ["proposals", "reviews"],
    });
  }

  async findById(id: string): Promise<Gig | null> {
    return this.repository.findOne({
      where: { id },
      relations: ["proposals", "reviews"],
    });
  }

  async createGig(gigData: Partial<Gig>): Promise<Gig> {
    const gig = this.repository.create(gigData);
    return this.repository.save(gig);
  }

  async updateGig(id: string, gigData: Partial<Gig>): Promise<Gig | null> {
    const gig = await this.repository.findOneBy({ id });

    if (!gig) {
      return null;
    }

    Object.assign(gig, gigData);
    return this.repository.save(gig);
  }

  async deleteGig(id: string): Promise<boolean> {
    const result = await this.repository.softDelete(id);
    return result.affected !== 0;
  }

  async findByClientId(clientId: string): Promise<Gig[]> {
    return this.repository.find({
      where: { clientId },
      order: { createdAt: "DESC" },
      relations: ["proposals", "reviews"],
    });
  }

  async searchGigs(query: string, skills?: string[]): Promise<Gig[]> {
    let queryBuilder = this.repository
      .createQueryBuilder("gig")
      .leftJoinAndSelect("gig.proposals", "proposal")
      .leftJoinAndSelect("gig.reviews", "review")
      .where("gig.isActive = :isActive", { isActive: true })
      .andWhere(
        "(LOWER(gig.title) LIKE LOWER(:query) OR LOWER(gig.description) LIKE LOWER(:query))",
        { query: `%${query}%` }
      );

    if (skills && skills.length > 0) {
      queryBuilder = queryBuilder.andWhere("gig.requiredSkills && :skills", {
        skills,
      });
    }

    return queryBuilder.orderBy("gig.createdAt", "DESC").getMany();
  }
}
