import { AppError } from "../common/errors";
import { GigStatus, ProposalStatus } from "../enums/gigStatus";
import { AuthUser, isAdmin } from "../middleware/auth";
import { Proposal } from "../models/proposal";
import { GigRepository, ProposalRepository } from "../repository/types";
import { CreateProposalInput, Pagination, UpdateProposalInput } from "../validations/schemas";
import { paginate, Paginated, toPage } from "./pagination";

/** Statuses only the gig owner may set, and the one only the freelancer may set. */
const OWNER_DECISIONS = new Set([ProposalStatus.ACCEPTED, ProposalStatus.REJECTED]);

export class ProposalService {
  constructor(
    private readonly proposals: ProposalRepository,
    private readonly gigs: GigRepository,
  ) {}

  async listAll(user: AuthUser, pagination: Pagination): Promise<Paginated<Proposal>> {
    if (!isAdmin(user)) throw AppError.forbidden("ADMIN_ONLY");
    return paginate(await this.proposals.find({}, toPage(pagination)), pagination);
  }

  async listForGig(user: AuthUser, gigId: string): Promise<Proposal[]> {
    const gig = await this.gigs.findById(gigId);
    if (!gig) throw AppError.notFound("GIG_NOT_FOUND");
    if (gig.clientId !== user.id && !isAdmin(user)) {
      throw AppError.forbidden("NOT_GIG_OWNER");
    }
    const [proposals] = await this.proposals.find({ gigId });
    return proposals;
  }

  async listForFreelancer(user: AuthUser, freelancerId: string): Promise<Proposal[]> {
    if (freelancerId !== user.id && !isAdmin(user)) throw AppError.forbidden();
    const [proposals] = await this.proposals.find({ freelancerId });
    return proposals;
  }

  async get(user: AuthUser, id: string): Promise<Proposal> {
    const proposal = await this.findOrFail(id);
    const gig = await this.gigs.findById(proposal.gigId);
    const allowed =
      proposal.freelancerId === user.id || gig?.clientId === user.id || isAdmin(user);
    if (!allowed) throw AppError.forbidden();
    return proposal;
  }

  async create(user: AuthUser, input: CreateProposalInput): Promise<Proposal> {
    const gig = await this.gigs.findById(input.gigId);
    if (!gig || !gig.isActive) throw AppError.notFound("GIG_NOT_FOUND");
    if (gig.status !== GigStatus.OPEN) throw AppError.badRequest("GIG_NOT_OPEN");
    if (gig.clientId === user.id) throw AppError.badRequest("CANNOT_APPLY_TO_OWN_GIG");

    const [existing] = await this.proposals.find({ gigId: gig.id, freelancerId: user.id });
    if (existing.some((p) => p.status !== ProposalStatus.WITHDRAWN)) {
      throw AppError.conflict("ALREADY_APPLIED");
    }

    return this.proposals.create({ ...input, freelancerId: user.id });
  }

  async update(user: AuthUser, id: string, input: UpdateProposalInput): Promise<Proposal> {
    const proposal = await this.findOrFail(id);
    const gig = await this.gigs.findById(proposal.gigId);
    if (!gig) throw AppError.notFound("GIG_NOT_FOUND");

    const isOwner = gig.clientId === user.id || isAdmin(user);
    const isAuthor = proposal.freelancerId === user.id;
    const { status, ...content } = input;
    const editsContent = Object.keys(content).length > 0;

    if (editsContent) {
      if (!isAuthor) throw AppError.forbidden("NOT_PROPOSAL_AUTHOR");
      if (proposal.status !== ProposalStatus.PENDING) {
        throw AppError.badRequest("PROPOSAL_NOT_EDITABLE");
      }
    }

    if (status && status !== proposal.status) {
      if (OWNER_DECISIONS.has(status)) {
        if (!isOwner) throw AppError.forbidden("NOT_GIG_OWNER");
        if (proposal.status !== ProposalStatus.PENDING) {
          throw AppError.badRequest("PROPOSAL_ALREADY_DECIDED");
        }
        if (status === ProposalStatus.ACCEPTED && gig.status !== GigStatus.OPEN) {
          throw AppError.badRequest("GIG_NOT_OPEN");
        }
      } else if (status === ProposalStatus.WITHDRAWN) {
        if (!isAuthor) throw AppError.forbidden("NOT_PROPOSAL_AUTHOR");
        if (proposal.status === ProposalStatus.ACCEPTED) {
          throw AppError.badRequest("PROPOSAL_ALREADY_ACCEPTED");
        }
      } else {
        throw AppError.badRequest("INVALID_STATUS_TRANSITION");
      }
    }

    const updated = await this.proposals.update(id, input);
    if (!updated) throw AppError.notFound("PROPOSAL_NOT_FOUND");

    if (status === ProposalStatus.ACCEPTED && proposal.status !== ProposalStatus.ACCEPTED) {
      await this.onAccepted(gig.id, id);
    }
    return updated;
  }

  async remove(user: AuthUser, id: string): Promise<void> {
    const proposal = await this.findOrFail(id);
    if (proposal.freelancerId !== user.id && !isAdmin(user)) {
      throw AppError.forbidden("NOT_PROPOSAL_AUTHOR");
    }
    await this.proposals.softDelete(id);
  }

  /** Accepting a proposal starts the gig and closes out the competing bids. */
  private async onAccepted(gigId: string, acceptedId: string) {
    await this.gigs.update(gigId, { status: GigStatus.IN_PROGRESS });
    const [others] = await this.proposals.find({ gigId });
    await Promise.all(
      others
        .filter((p) => p.id !== acceptedId && p.status === ProposalStatus.PENDING)
        .map((p) => this.proposals.update(p.id, { status: ProposalStatus.REJECTED })),
    );
  }

  private async findOrFail(id: string): Promise<Proposal> {
    const proposal = await this.proposals.findById(id);
    if (!proposal) throw AppError.notFound("PROPOSAL_NOT_FOUND");
    return proposal;
  }
}
