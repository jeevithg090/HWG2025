import { z } from "zod";

export const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
});

export const LoginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
