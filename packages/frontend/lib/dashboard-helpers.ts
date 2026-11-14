/**
 * Data-loading helpers for dashboard pages. Each helper resolves to
 * `{ data, error }` so pages can render an error state instead of crashing.
 */

import { freelanceApi } from "./api-client";
import type { ApiResult } from "./api-client";
import { getAuthToken } from "./auth-utils";
import { toNumber } from "./format";
import type {
  ClientDashboard,
  FreelancerDashboard,
  Gig,
  GigStatus,
  Proposal,
  Review,
} from "./types";

export interface LoadResult<T> {
  data: T;
  error: string | null;
}

function unwrap<T>(
  result: ApiResult<{ data: T }>,
  fallbackData: T,
  fallbackMessage: string,
): LoadResult<T> {
  if (result.success) {
    return { data: result.data ?? fallbackData, error: null };
  }
  return { data: fallbackData, error: result.message || fallbackMessage };
}

export async function fetchProjects(): Promise<LoadResult<Gig[]>> {
  const result = await freelanceApi.getProjects(undefined, getAuthToken());
  return unwrap(result, [], "Failed to load projects");
}

export async function fetchClientProjects(clientId: string): Promise<LoadResult<Gig[]>> {
  const result = await freelanceApi.getGigsByClientId(clientId, getAuthToken());
  return unwrap(result, [], "Failed to load your projects");
}

export async function fetchProposalsByGigId(gigId: string): Promise<LoadResult<Proposal[]>> {
  const result = await freelanceApi.getProposalsByGigId(gigId, getAuthToken());
  return unwrap(result, [], "Failed to load proposals");
}

export async function fetchProposalsByFreelancerId(
  freelancerId: string,
): Promise<LoadResult<Proposal[]>> {
  const result = await freelanceApi.getProposalsByFreelancerId(freelancerId, getAuthToken());
  return unwrap(result, [], "Failed to load your proposals");
}

export async function fetchReviewsByGigId(gigId: string): Promise<LoadResult<Review[]>> {
  const result = await freelanceApi.getReviewsByGigId(gigId, getAuthToken());
  return unwrap(result, [], "Failed to load reviews");
}

export async function fetchClientDashboard(
  clientId: string,
): Promise<LoadResult<ClientDashboard | null>> {
  const result = await freelanceApi.getClientDashboard(clientId, getAuthToken());
  return unwrap<ClientDashboard | null>(result, null, "Failed to load dashboard");
}

export async function fetchFreelancerDashboard(
  freelancerId: string,
): Promise<LoadResult<FreelancerDashboard | null>> {
  const result = await freelanceApi.getFreelancerDashboard(freelancerId, getAuthToken());
  return unwrap<FreelancerDashboard | null>(result, null, "Failed to load dashboard");
}

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

export type BudgetRange = "all" | "under-1k" | "1k-5k" | "5k-10k" | "over-10k";

/** True when the gig's budget falls in the selected range (gigs without budget only match "all"). */
export function matchesBudgetRange(budget: Gig["budget"], range: BudgetRange): boolean {
  if (range === "all") return true;
  const value = toNumber(budget);
  if (value === null) return false;
  switch (range) {
    case "under-1k":
      return value < 1000;
    case "1k-5k":
      return value >= 1000 && value <= 5000;
    case "5k-10k":
      return value > 5000 && value <= 10000;
    case "over-10k":
      return value > 10000;
  }
}

/** Case-insensitive search over title, description and required skills. */
export function matchesSearch(gig: Gig, term: string): boolean {
  const needle = term.trim().toLowerCase();
  if (!needle) return true;
  return (
    gig.title.toLowerCase().includes(needle) ||
    gig.description.toLowerCase().includes(needle) ||
    (gig.requiredSkills ?? []).some((skill) => skill.toLowerCase().includes(needle))
  );
}

export function filterGigs(gigs: Gig[], term: string, range: BudgetRange): Gig[] {
  return gigs.filter((gig) => matchesSearch(gig, term) && matchesBudgetRange(gig.budget, range));
}

export interface ProposalStats {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  /** Share of decided proposals that were accepted, 0-100 (0 when none decided). */
  successRate: number;
  /** Sum of bid amounts on accepted proposals. */
  acceptedValue: number;
}

export function computeProposalStats(proposals: Proposal[]): ProposalStats {
  let pending = 0;
  let accepted = 0;
  let rejected = 0;
  let acceptedValue = 0;
  for (const proposal of proposals) {
    if (proposal.status === "pending") pending += 1;
    else if (proposal.status === "accepted") {
      accepted += 1;
      acceptedValue += toNumber(proposal.bidAmount) ?? 0;
    } else if (proposal.status === "rejected") rejected += 1;
  }
  const decided = accepted + rejected;
  return {
    total: proposals.length,
    pending,
    accepted,
    rejected,
    successRate: decided === 0 ? 0 : Math.round((accepted / decided) * 100),
    acceptedValue,
  };
}

export function countGigsByStatus(gigs: Gig[]): Record<GigStatus, number> {
  const counts: Record<GigStatus, number> = {
    open: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0,
  };
  for (const gig of gigs) {
    if (gig.status in counts) counts[gig.status] += 1;
  }
  return counts;
}

/** Sum of the budgets of the given gigs, ignoring gigs without a budget. */
export function totalBudget(gigs: Gig[]): number {
  return gigs.reduce((sum, gig) => sum + (toNumber(gig.budget) ?? 0), 0);
}
