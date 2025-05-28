// src/validations/gigValidation.ts
import { z } from "zod";
import { GigStatus } from "../enums/gigStatus";

export const CreateGigSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title cannot exceed 100 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  clientId: z.string().uuid("Invalid client ID format"),
  budget: z.number().positive("Budget must be positive").optional(),
  requiredSkills: z.array(z.string()).optional(),
  deadline: z.string().datetime().optional(),
  attachmentUrl: z.string().url("Invalid attachment URL").optional(),
});

export const UpdateGigSchema = CreateGigSchema.partial().extend({
  status: z
    .enum([
      GigStatus.OPEN,
      GigStatus.IN_PROGRESS,
      GigStatus.COMPLETED,
      GigStatus.CANCELLED,
    ])
    .optional(),
  isActive: z.boolean().optional(),
});
