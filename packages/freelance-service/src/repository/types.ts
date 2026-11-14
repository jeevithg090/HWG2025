import { GigStatus } from "../enums/gigStatus";
import { Gig } from "../models/gig";
import { Proposal } from "../models/proposal";
import { Review } from "../models/review";

export interface Page {
  skip: number;
  take: number;
}

export interface GigFilter {
  status?: GigStatus;
  clientId?: string;
  query?: string;
  skills?: string[];
  includeInactive?: boolean;
}

export interface GigRepository {
  find(filter: GigFilter, page?: Page): Promise<[Gig[], number]>;
  findById(id: string): Promise<Gig | null>;
  create(data: Partial<Gig>): Promise<Gig>;
  update(id: string, changes: Partial<Gig>): Promise<Gig | null>;
  softDelete(id: string): Promise<boolean>;
}

export interface ProposalFilter {
  gigId?: string;
  freelancerId?: string;
}

export interface ProposalRepository {
  find(filter: ProposalFilter, page?: Page): Promise<[Proposal[], number]>;
  findById(id: string): Promise<Proposal | null>;
  create(data: Partial<Proposal>): Promise<Proposal>;
  update(id: string, changes: Partial<Proposal>): Promise<Proposal | null>;
  softDelete(id: string): Promise<boolean>;
}

export interface ReviewFilter {
  gigId?: string;
  reviewerId?: string;
  revieweeId?: string;
}

export interface ReviewRepository {
  find(filter: ReviewFilter, page?: Page): Promise<[Review[], number]>;
  findById(id: string): Promise<Review | null>;
  create(data: Partial<Review>): Promise<Review>;
  softDelete(id: string): Promise<boolean>;
}

export interface Repositories {
  gigs: GigRepository;
  proposals: ProposalRepository;
  reviews: ReviewRepository;
}
