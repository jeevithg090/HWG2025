import { ReviewRepository } from "../repository/reviewRepository";
import { GigRepository } from "../repository/gigRepository";
import { Review } from "../models/review";
import { CreateReviewSchema } from "../validations/reviewValidation";
import logger from "../common/logger";
import { Transactional } from "typeorm-transactional";
import { z } from "zod";
import { GigStatus } from "../enums/gigStatus";

export class ReviewService {
  private reviewRepository: ReviewRepository;
  private gigRepository: GigRepository;

  constructor() {
    this.reviewRepository = new ReviewRepository();
    this.gigRepository = new GigRepository();
  }

  async getAllReviews(
    filter?: Partial<Review>,
    page = 1,
    limit = 10
  ): Promise<Review[]> {
    const skip = (page - 1) * limit;
    return this.reviewRepository.findAll(filter, skip, limit);
  }

  async getReviewById(id: string): Promise<Review | null> {
    return this.reviewRepository.findById(id);
  }

  @Transactional()
  async createReview(
    reviewData: z.infer<typeof CreateReviewSchema>
  ): Promise<Review> {
    try {
      // Validate the input data
      CreateReviewSchema.parse(reviewData);

      // Check if the gig exists and is completed
      const gig = await this.gigRepository.findById(reviewData.gigId);
      if (!gig) {
        throw new Error("Gig not found");
      }
      if (gig.status !== GigStatus.COMPLETED) {
        throw new Error("Can only review completed gigs");
      }

      // Check if the user has already reviewed this gig
      const existingReview = await this.reviewRepository.findAll({
        gigId: reviewData.gigId,
        reviewerId: reviewData.reviewerId,
      });

      if (existingReview.length > 0) {
        throw new Error("You have already reviewed this gig");
      }

      return await this.reviewRepository.createReview(reviewData);
    } catch (error) {
      logger.error(`Error creating review: ${error}`);
      throw error;
    }
  }

  @Transactional()
  async deleteReview(id: string): Promise<boolean> {
    try {
      return await this.reviewRepository.deleteReview(id);
    } catch (error) {
      logger.error(`Error deleting review ${id}: ${error}`);
      throw error;
    }
  }

  async getReviewsByReviewerId(reviewerId: string): Promise<Review[]> {
    return this.reviewRepository.findByReviewerId(reviewerId);
  }

  async getReviewsByRevieweeId(revieweeId: string): Promise<Review[]> {
    return this.reviewRepository.findByRevieweeId(revieweeId);
  }

  async getReviewsByGigId(gigId: string): Promise<Review[]> {
    return this.reviewRepository.findByGigId(gigId);
  }

  async getUserAverageRating(userId: string): Promise<number> {
    return this.reviewRepository.getAverageRating(userId);
  }
}
