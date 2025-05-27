import { Repository } from "typeorm";
import { Review } from "../models/review";
import DatabaseConnection from "../database/database";

export class ReviewRepository {
  private repository: Repository<Review>;

  constructor() {
    const dataSource = DatabaseConnection.getDefaultDataSource();
    this.repository = dataSource.getRepository(Review);
  }

  async findAll(filter?: Partial<Review>, skip = 0, take = 10): Promise<Review[]> {
    return this.repository.find({
      where: filter,
      skip,
      take,
      order: { createdAt: "DESC" },
      relations: ["gig"],
    });
  }

  async findById(id: string): Promise<Review | null> {
    return this.repository.findOne({
      where: { id },
      relations: ["gig"],
    });
  }

  async createReview(reviewData: Partial<Review>): Promise<Review> {
    const review = this.repository.create(reviewData);
    return this.repository.save(review);
  }

  async updateReview(id: string, reviewData: Partial<Review>): Promise<Review | null> {
    const review = await this.repository.findOneBy({ id });
    
    if (!review) {
      return null;
    }
    
    Object.assign(review, reviewData);
    return this.repository.save(review);
  }

  async deleteReview(id: string): Promise<boolean> {
    const result = await this.repository.softDelete(id);
    return result.affected !== 0;
  }

  async findByReviewerId(reviewerId: string): Promise<Review[]> {
    return this.repository.find({
      where: { reviewerId },
      order: { createdAt: "DESC" },
      relations: ["gig"],
    });
  }

  async findByRevieweeId(revieweeId: string): Promise<Review[]> {
    return this.repository.find({
      where: { revieweeId },
      order: { createdAt: "DESC" },
      relations: ["gig"],
    });
  }

  async findByGigId(gigId: string): Promise<Review[]> {
    return this.repository.find({
      where: { gigId },
      order: { createdAt: "DESC" },
      relations: ["gig"],
    });
  }

  async getAverageRating(userId: string): Promise<number> {
    const result = await this.repository
      .createQueryBuilder("review")
      .where("review.revieweeId = :userId", { userId })
      .select("AVG(review.rating)", "averageRating")
      .getRawOne();
    
    return result?.averageRating || 0;
  }
}
