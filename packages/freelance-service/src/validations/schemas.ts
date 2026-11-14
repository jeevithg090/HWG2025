import { z } from "zod";
import { GigStatus, ProposalStatus } from "../enums/gigStatus";

const uuid = z.string().uuid();
const skills = z.array(z.string().trim().min(1).max(50)).max(30);

export const IdParamSchema = z.object({ id: uuid });

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const GigListQuerySchema = PaginationSchema.extend({
  status: z.nativeEnum(GigStatus).optional(),
});

export const GigSearchQuerySchema = PaginationSchema.extend({
  query: z.string().trim().max(200).optional(),
  // "react,node" -> ["react", "node"]
  skills: z
    .string()
    .optional()
    .transform((value) =>
      value
        ? value
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean)
        : undefined,
    ),
  status: z.nativeEnum(GigStatus).optional(),
});

export const CreateGigSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title cannot exceed 100 characters"),
  description: z.string().trim().min(20, "Description must be at least 20 characters").max(10000),
  budget: z.number().positive("Budget must be positive").max(99_999_999).optional(),
  requiredSkills: skills.optional(),
  deadline: z.string().datetime({ offset: true }).optional(),
  attachmentUrl: z.string().url("Invalid attachment URL").optional(),
});

export const UpdateGigSchema = CreateGigSchema.partial().extend({
  status: z.nativeEnum(GigStatus).optional(),
  isActive: z.boolean().optional(),
});

export const CreateProposalSchema = z.object({
  gigId: uuid,
  coverLetter: z.string().trim().min(20, "Cover letter must be at least 20 characters").max(10000),
  bidAmount: z.number().positive("Bid amount must be positive").max(99_999_999),
  estimatedTimeInDays: z.number().int().positive().max(3650).optional(),
});

export const UpdateProposalSchema = CreateProposalSchema.omit({ gigId: true })
  .partial()
  .extend({ status: z.nativeEnum(ProposalStatus).optional() });

export const CreateReviewSchema = z.object({
  gigId: uuid,
  revieweeId: uuid,
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  comment: z.string().trim().max(2000).optional(),
});

export type CreateGigInput = z.infer<typeof CreateGigSchema>;
export type UpdateGigInput = z.infer<typeof UpdateGigSchema>;
export type CreateProposalInput = z.infer<typeof CreateProposalSchema>;
export type UpdateProposalInput = z.infer<typeof UpdateProposalSchema>;
export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;
export type Pagination = z.infer<typeof PaginationSchema>;
