import { FindOptionsWhere } from "typeorm";
import { dataSource } from "../database/database";
import { Gig } from "../models/gig";
import { Proposal } from "../models/proposal";
import { Review } from "../models/review";
import {
  GigRepository,
  ProposalRepository,
  Repositories,
  ReviewRepository,
} from "./types";

const gigs = () => dataSource.getRepository(Gig);
const proposals = () => dataSource.getRepository(Proposal);
const reviews = () => dataSource.getRepository(Review);

const gigRepository: GigRepository = {
  find(filter, page) {
    const qb = gigs()
      .createQueryBuilder("gig")
      .loadRelationCountAndMap("gig.proposalCount", "gig.proposals", "proposal", (qb) =>
        qb.andWhere("proposal.deletedAt IS NULL"),
      )
      .orderBy("gig.createdAt", "DESC");

    if (!filter.includeInactive) qb.andWhere("gig.isActive = true");
    if (filter.status) qb.andWhere("gig.status = :status", { status: filter.status });
    if (filter.clientId) qb.andWhere("gig.clientId = :clientId", { clientId: filter.clientId });
    if (filter.query) {
      qb.andWhere("(gig.title ILIKE :query OR gig.description ILIKE :query)", {
        // Escape LIKE wildcards so user input is matched literally.
        query: `%${filter.query.replace(/[\\%_]/g, (c) => `\\${c}`)}%`,
      });
    }
    if (filter.skills?.length) {
      qb.andWhere("gig.requiredSkills && :skills", { skills: filter.skills });
    }
    if (page) qb.skip(page.skip).take(page.take);
    return qb.getManyAndCount();
  },
  findById(id) {
    return gigs()
      .createQueryBuilder("gig")
      .loadRelationCountAndMap("gig.proposalCount", "gig.proposals", "proposal", (qb) =>
        qb.andWhere("proposal.deletedAt IS NULL"),
      )
      .leftJoinAndSelect("gig.reviews", "review")
      .where("gig.id = :id", { id })
      .getOne();
  },
  create(data) {
    return gigs().save(gigs().create(data));
  },
  async update(id, changes) {
    const gig = await gigs().findOneBy({ id });
    if (!gig) return null;
    return gigs().save(gigs().merge(gig, changes));
  },
  async softDelete(id) {
    const result = await gigs().softDelete(id);
    return (result.affected ?? 0) > 0;
  },
};

const proposalRepository: ProposalRepository = {
  find(filter, page) {
    return proposals().findAndCount({
      where: filter as FindOptionsWhere<Proposal>,
      relations: { gig: true },
      order: { createdAt: "DESC" },
      ...(page ?? {}),
    });
  },
  findById(id) {
    return proposals().findOne({ where: { id }, relations: { gig: true } });
  },
  create(data) {
    return proposals().save(proposals().create(data));
  },
  async update(id, changes) {
    const proposal = await proposals().findOneBy({ id });
    if (!proposal) return null;
    return proposals().save(proposals().merge(proposal, changes));
  },
  async softDelete(id) {
    const result = await proposals().softDelete(id);
    return (result.affected ?? 0) > 0;
  },
};

const reviewRepository: ReviewRepository = {
  find(filter, page) {
    return reviews().findAndCount({
      where: filter as FindOptionsWhere<Review>,
      order: { createdAt: "DESC" },
      ...(page ?? {}),
    });
  },
  findById(id) {
    return reviews().findOneBy({ id });
  },
  create(data) {
    return reviews().save(reviews().create(data));
  },
  async softDelete(id) {
    const result = await reviews().softDelete(id);
    return (result.affected ?? 0) > 0;
  },
};

export const typeormRepositories: Repositories = {
  gigs: gigRepository,
  proposals: proposalRepository,
  reviews: reviewRepository,
};
