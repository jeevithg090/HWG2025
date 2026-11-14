import { AppError } from "../common/errors";
import { GigStatus, ProposalStatus } from "../enums/gigStatus";
import { AuthUser, isAdmin } from "../middleware/auth";
import { Review } from "../models/review";
import { Repositories, ReviewFilter } from "../repository/types";
import { CreateReviewInput, Pagination } from "../validations/schemas";
import { average, paginate, Paginated, toPage } from "./pagination";

export class ReviewService {
  constructor(private readonly repos: Repositories) {}

  async list(filter: ReviewFilter, pagination: Pagination): Promise<Paginated<Review>> {
    return paginate(await this.repos.reviews.find(filter, toPage(pagination)), pagination);
  }

  async listBy(filter: ReviewFilter): Promise<Review[]> {
    const [reviews] = await this.repos.reviews.find(filter);
    return reviews;
  }

  async get(id: string): Promise<Review> {
    const review = await this.repos.reviews.findById(id);
    if (!review) throw AppError.notFound("REVIEW_NOT_FOUND");
    return review;
  }

  async averageRating(userId: string): Promise<number | null> {
    const reviews = await this.listBy({ revieweeId: userId });
    return average(reviews.map((r) => r.rating));
  }

  /**
   * Only the two parties of a completed gig — the client and the freelancer
   * whose proposal was accepted — may review each other, once each.
   */
  async create(user: AuthUser, input: CreateReviewInput): Promise<Review> {
    const gig = await this.repos.gigs.findById(input.gigId);
    if (!gig) throw AppError.notFound("GIG_NOT_FOUND");
    if (gig.status !== GigStatus.COMPLETED) throw AppError.badRequest("GIG_NOT_COMPLETED");
    if (input.revieweeId === user.id) throw AppError.badRequest("CANNOT_REVIEW_SELF");

    const [proposals] = await this.repos.proposals.find({ gigId: gig.id });
    const hired = proposals.find((p) => p.status === ProposalStatus.ACCEPTED);
    const parties = new Set([gig.clientId, hired?.freelancerId].filter(Boolean));
    if (!parties.has(user.id) || !parties.has(input.revieweeId)) {
      throw AppError.forbidden("NOT_GIG_PARTICIPANT");
    }

    const [existing] = await this.repos.reviews.find({ gigId: gig.id, reviewerId: user.id });
    if (existing.length > 0) throw AppError.conflict("ALREADY_REVIEWED");

    return this.repos.reviews.create({ ...input, reviewerId: user.id });
  }

  async remove(user: AuthUser, id: string): Promise<void> {
    const review = await this.get(id);
    if (review.reviewerId !== user.id && !isAdmin(user)) {
      throw AppError.forbidden("NOT_REVIEW_AUTHOR");
    }
    await this.repos.reviews.softDelete(id);
  }
}
