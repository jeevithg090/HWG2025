// src/validations/reviewValidation.ts
import { z } from "zod";

export const CreateReviewSchema = z.object({
  gigId: z.string().uuid("Invalid gig ID format"),
  reviewerId: z.string().uuid("Invalid reviewer ID format"),
  revieweeId: z.string().uuid("Invalid reviewee ID format"),
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  comment: z.string().optional()
});
