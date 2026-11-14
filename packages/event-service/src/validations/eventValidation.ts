import { z } from "zod";
import { EventTypes } from "../enums/eventTypes";

const dateTime = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), { message: "Invalid date time" })
  .transform((value) => new Date(value));

const booleanQuery = z
  .enum(["true", "false"])
  .transform((value) => value === "true")
  .optional();

const EventFields = z.object({
  title: z.string().trim().min(3).max(100),
  description: z.string().trim().min(10).max(10000),
  startDateTime: dateTime,
  endDateTime: dateTime.optional(),
  venue: z.string().trim().max(200).optional(),
  onlineLink: z.string().url().optional(),
  eventType: z.nativeEnum(EventTypes).default(EventTypes.MEETUP),
  maxAttendees: z.number().int().positive().max(1_000_000).optional(),
  coverImage: z.string().url().optional(),
  tags: z.array(z.string().trim().min(1).max(30)).max(20).optional(),
  isPublished: z.boolean().optional(),
});

const endsAfterStart = (data: { startDateTime?: Date; endDateTime?: Date }) =>
  !data.startDateTime || !data.endDateTime || data.endDateTime >= data.startDateTime;

const endAfterStartIssue = {
  message: "endDateTime must be after startDateTime",
  path: ["endDateTime"],
};

export const CreateEventSchema = EventFields.refine(endsAfterStart, endAfterStartIssue);

export const UpdateEventSchema = EventFields.partial()
  .extend({
    // Without this, partial() would still apply the eventType default and
    // silently reset the type on every update.
    eventType: z.nativeEnum(EventTypes).optional(),
    isActive: z.boolean().optional(),
  })
  .refine(endsAfterStart, endAfterStartIssue);

export const EventQuerySchema = z.object({
  isActive: booleanQuery,
  isPublished: booleanQuery,
  eventType: z.nativeEnum(EventTypes).optional(),
  organizerId: z.string().uuid().optional(),
  upcoming: booleanQuery,
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const IdSchema = z.string().uuid();

export const MarkAttendanceSchema = z.object({
  hasAttended: z.boolean().default(true),
});

export type CreateEventInput = z.infer<typeof CreateEventSchema>;
export type UpdateEventInput = z.infer<typeof UpdateEventSchema>;
export type EventQuery = z.infer<typeof EventQuerySchema>;
