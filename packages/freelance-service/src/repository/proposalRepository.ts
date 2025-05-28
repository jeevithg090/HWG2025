import { Repository } from "typeorm";
import { Proposal } from "../models/proposal";
import DatabaseConnection from "../database/database";

export class ProposalRepository {
  private repository: Repository<Proposal>;

  constructor() {
    const dataSource = DatabaseConnection.getDefaultDataSource();
    this.repository = dataSource.getRepository(Proposal);
  }

  async findAll(
    filter?: Partial<Proposal>,
    skip = 0,
    take = 10
  ): Promise<Proposal[]> {
    return this.repository.find({
      where: filter,
      skip,
      take,
      order: { createdAt: "DESC" },
      relations: ["gig"],
    });
  }

  async findById(id: string): Promise<Proposal | null> {
    return this.repository.findOne({
      where: { id },
      relations: ["gig"],
    });
  }

  async createProposal(proposalData: Partial<Proposal>): Promise<Proposal> {
    const proposal = this.repository.create(proposalData);
    return this.repository.save(proposal);
  }

  async updateProposal(
    id: string,
    proposalData: Partial<Proposal>
  ): Promise<Proposal | null> {
    const proposal = await this.repository.findOneBy({ id });

    if (!proposal) {
      return null;
    }

    Object.assign(proposal, proposalData);
    return this.repository.save(proposal);
  }

  async deleteProposal(id: string): Promise<boolean> {
    const result = await this.repository.softDelete(id);
    return result.affected !== 0;
  }

  async findByFreelancerId(freelancerId: string): Promise<Proposal[]> {
    return this.repository.find({
      where: { freelancerId },
      order: { createdAt: "DESC" },
      relations: ["gig"],
    });
  }

  async findByGigId(gigId: string): Promise<Proposal[]> {
    return this.repository.find({
      where: { gigId },
      order: { createdAt: "DESC" },
      relations: ["gig"],
    });
  }

  async countByGigId(gigId: string): Promise<number> {
    return this.repository.count({
      where: { gigId },
    });
  }
}
