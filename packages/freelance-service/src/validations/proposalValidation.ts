// src/validations/proposalValidation.ts
import { z } from "zod";
import { ProposalStatus } from "../enums/gigStatus";

export const CreateProposalSchema = z.object({
  freelancerId: z.string().uuid("Invalid freelancer ID format"),
  gigId: z.string().uuid("Invalid gig ID format"),
  coverLetter: z
    .string()
    .min(20, "Cover letter must be at least 20 characters"),
  bidAmount: z.number().positive("Bid amount must be positive"),
  estimatedTimeInDays: z.number().int().positive().optional(),
});

export const UpdateProposalSchema = z.object({
  coverLetter: z
    .string()
    .min(20, "Cover letter must be at least 20 characters")
    .optional(),
  bidAmount: z.number().positive("Bid amount must be positive").optional(),
  estimatedTimeInDays: z.number().int().positive().optional(),
  status: z
    .enum([
      ProposalStatus.PENDING,
      ProposalStatus.ACCEPTED,
      ProposalStatus.REJECTED,
      ProposalStatus.WITHDRAWN,
    ])
    .optional(),
  isActive: z.boolean().optional(),
});
