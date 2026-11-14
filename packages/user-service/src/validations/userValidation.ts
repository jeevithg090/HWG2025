import { z } from "zod";
import { SELF_ASSIGNABLE_USER_TYPES } from "../enums/userTypes";

const email = z.string().trim().toLowerCase().email();

export const CreateUserSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email,
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
  // Accept any casing ("FREELANCER", "Client") but never allow "admin".
  type: z
    .string()
    .transform((value) => value.toLowerCase())
    .pipe(z.enum(SELF_ASSIGNABLE_USER_TYPES))
    .optional(),
  bio: z.string().max(2000).optional(),
  skills: z.array(z.string().trim().min(1).max(50)).max(50).optional(),
});

export const LoginUserSchema = z.object({
  email,
  password: z.string().min(1),
});

export const UpdateProfileSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    bio: z.string().max(2000).nullable(),
    skills: z.array(z.string().trim().min(1).max(50)).max(50),
  })
  .partial()
  .strict();

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type LoginUserInput = z.infer<typeof LoginUserSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
