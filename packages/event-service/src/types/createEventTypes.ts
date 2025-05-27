import { EventType } from "./eventTypes";

export type CreateEventInput = {
  title: string;
  description: string;
  startDateTime: Date;
  endDateTime?: Date;
  venue?: string;
  onlineLink?: string;
  eventType: EventType;
  maxAttendees?: number;
  organizerId: string;
  coverImage?: string;
  tags?: string[];
  isActive?: boolean;
  isPublished?: boolean;
};

export type RegisterEventInput = {
  userId: string;
  userEmail: string;
  userName?: string;
};
