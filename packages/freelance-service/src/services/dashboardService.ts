import { AppError } from "../common/errors";
import { GigStatus, ProposalStatus } from "../enums/gigStatus";
import { AuthUser, isAdmin } from "../middleware/auth";
import { Repositories } from "../repository/types";
import { average } from "./pagination";

const isActiveStatus = (status: GigStatus) =>
  status !== GigStatus.COMPLETED && status !== GigStatus.CANCELLED;

export class DashboardService {
  constructor(private readonly repos: Repositories) {}

  async client(user: AuthUser, clientId: string) {
    this.assertSelfOrAdmin(user, clientId);
    const [gigs] = await this.repos.gigs.find({ clientId, includeInactive: true });
    const [reviews] = await this.repos.reviews.find({ revieweeId: clientId });

    return {
      totalGigs: gigs.length,
      activeGigs: gigs.filter((g) => isActiveStatus(g.status)).length,
      completedGigs: gigs.filter((g) => g.status === GigStatus.COMPLETED).length,
      totalProposalsReceived: gigs.reduce((sum, g) => sum + (g.proposalCount ?? 0), 0),
      averageRating: average(reviews.map((r) => r.rating)),
      gigs: gigs.map((gig) => ({ gig, proposalCount: gig.proposalCount ?? 0 })),
    };
  }

  async freelancer(user: AuthUser, freelancerId: string) {
    this.assertSelfOrAdmin(user, freelancerId);
    const [proposals] = await this.repos.proposals.find({ freelancerId });
    const [reviews] = await this.repos.reviews.find({ revieweeId: freelancerId });
    const count = (status: ProposalStatus) => proposals.filter((p) => p.status === status).length;

    return {
      totalProposals: proposals.length,
      acceptedProposals: count(ProposalStatus.ACCEPTED),
      pendingProposals: count(ProposalStatus.PENDING),
      rejectedProposals: count(ProposalStatus.REJECTED),
      averageRating: average(reviews.map((r) => r.rating)),
      recentProposals: proposals.slice(0, 5),
      recentReviews: reviews.slice(0, 5),
    };
  }

  async admin(user: AuthUser) {
    if (!isAdmin(user)) throw AppError.forbidden("ADMIN_ONLY");
    const [gigs, totalGigs] = await this.repos.gigs.find({ includeInactive: true });
    const [proposals, totalProposals] = await this.repos.proposals.find({});
    const [reviews] = await this.repos.reviews.find({});

    return {
      totalGigs,
      activeGigs: gigs.filter((g) => isActiveStatus(g.status)).length,
      totalProposals,
      acceptedProposals: proposals.filter((p) => p.status === ProposalStatus.ACCEPTED).length,
      averageRating: average(reviews.map((r) => r.rating)),
      recentGigs: gigs.slice(0, 5),
      recentProposals: proposals.slice(0, 5),
    };
  }

  private assertSelfOrAdmin(user: AuthUser, targetId: string) {
    if (user.id !== targetId && !isAdmin(user)) throw AppError.forbidden();
  }
}
