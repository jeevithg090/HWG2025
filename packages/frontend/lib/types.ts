/**
 * Loose types describing the data returned by the backend services.
 * Only the fields the frontend actually uses are listed; everything optional
 * that the backend may omit is marked as such.
 */

export type UserType = "freelancer" | "client" | "startup" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  type: UserType;
  bio?: string | null;
  skills?: string[] | null;
  createdAt?: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  type?: Exclude<UserType, "admin">;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// ---------------------------------------------------------------------------
// Freelance service
// ---------------------------------------------------------------------------

export type GigStatus = "open" | "in_progress" | "completed" | "cancelled";
export type ProposalStatus = "pending" | "accepted" | "rejected" | "withdrawn";

/** Monetary amounts are numbers; older service versions serialized them as strings. */
export type Amount = number | string;

export interface Gig {
  id: string;
  title: string;
  description: string;
  clientId: string;
  budget?: Amount | null;
  requiredSkills?: string[] | null;
  status: GigStatus;
  deadline?: string | null;
  attachmentUrl?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  /** Number of proposals received; the proposals themselves are only visible to the owner. */
  proposalCount?: number;
  /** Only included by GET /gigs/:id. */
  reviews?: Review[];
}

export interface CreateGigPayload {
  title: string;
  description: string;
  budget?: number;
  requiredSkills?: string[];
  deadline?: string;
  attachmentUrl?: string;
}

export type UpdateGigPayload = Partial<CreateGigPayload> & {
  status?: GigStatus;
  isActive?: boolean;
};

export interface Proposal {
  id: string;
  freelancerId: string;
  gigId: string;
  gig?: Gig;
  coverLetter: string;
  bidAmount: Amount;
  estimatedTimeInDays?: number | null;
  status: ProposalStatus;
  isActive?: boolean;
  createdAt?: string;
}

export interface CreateProposalPayload {
  gigId: string;
  coverLetter: string;
  bidAmount: number;
  estimatedTimeInDays?: number;
}

export type UpdateProposalPayload = Partial<Omit<CreateProposalPayload, "gigId">> & {
  status?: ProposalStatus;
  isActive?: boolean;
};

export interface Review {
  id: string;
  gigId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment?: string | null;
  createdAt?: string;
}

export interface CreateReviewPayload {
  gigId: string;
  revieweeId: string;
  rating: number;
  comment?: string;
}

export interface ClientDashboard {
  totalGigs: number;
  activeGigs: number;
  completedGigs: number;
  gigs: { gig: Gig; proposalCount: number; averageRating: number | null }[];
}

export interface FreelancerDashboard {
  totalProposals: number;
  acceptedProposals: number;
  pendingProposals: number;
  averageRating: number | null;
  recentProposals?: Proposal[];
  recentReviews?: Review[];
}

// ---------------------------------------------------------------------------
// Event service
// ---------------------------------------------------------------------------

export type EventType = "HACKATHON" | "MEETUP" | "WEBINAR" | "CONFERENCE" | "WORKSHOP" | "OTHER";

export const EVENT_TYPES: readonly EventType[] = [
  "HACKATHON",
  "MEETUP",
  "WEBINAR",
  "CONFERENCE",
  "WORKSHOP",
  "OTHER",
];

export interface TechEvent {
  id: string;
  title: string;
  description: string;
  startDateTime: string;
  endDateTime?: string | null;
  venue?: string | null;
  onlineLink?: string | null;
  eventType: EventType;
  isActive?: boolean;
  isPublished?: boolean;
  maxAttendees?: number | null;
  currentAttendees?: number;
  organizerId?: string | null;
  coverImage?: string | null;
  tags?: string[] | null;
  createdAt?: string;
}

export interface CreateEventPayload {
  title: string;
  description: string;
  startDateTime: string;
  endDateTime?: string;
  venue?: string;
  onlineLink?: string;
  eventType: EventType;
  maxAttendees?: number;
  coverImage?: string;
  tags?: string[];
  isPublished?: boolean;
}

export type UpdateEventPayload = Partial<CreateEventPayload> & { isActive?: boolean };

export interface ValidationIssue {
  path?: string | (string | number)[];
  message: string;
}

export interface EventAttendee {
  id: string;
  eventId: string;
  userId: string;
  userEmail: string;
  userName?: string | null;
  hasAttended: boolean;
  status: string;
  event?: TechEvent;
  createdAt?: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages?: number;
}

export interface EventFilters {
  eventType?: EventType | string;
  isActive?: boolean;
  isPublished?: boolean;
  page?: number;
  limit?: number;
}
