import { z } from "zod";
import { EventTypes } from "../enums/eventTypes";

export const CreateEventSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10),
  startDateTime: z.string().refine((value) => !isNaN(Date.parse(value)), {
    message: "Invalid start date time format",
  }),
  endDateTime: z
    .string()
    .refine((value) => !isNaN(Date.parse(value)), {
      message: "Invalid end date time format",
    })
    .optional(),
  venue: z.string().optional(),
  onlineLink: z.string().url().optional(),
  eventType: z.nativeEnum(EventTypes),
  maxAttendees: z.number().positive().optional(),
  organizerId: z.string().uuid(),
  coverImage: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
});

export const UpdateEventSchema = CreateEventSchema.partial();

export const RegisterForEventSchema = z.object({
  userId: z.string().uuid(),
  userEmail: z.string().email(),
  userName: z.string().optional(),
});

export const EventQuerySchema = z.object({
  isActive: z.boolean().optional(),
  eventType: z.string().optional(),
  isPublished: z.boolean().optional(),
  page: z.number().positive().optional(),
  limit: z.number().positive().optional(),
});
