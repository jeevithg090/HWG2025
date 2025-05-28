import { ProposalRepository } from "../repository/proposalRepository";
import { GigRepository } from "../repository/gigRepository";
import { Proposal } from "../models/proposal";
import {
  CreateProposalSchema,
  UpdateProposalSchema,
} from "../validations/proposalValidation";
import logger from "../common/logger";
import { Transactional } from "typeorm-transactional";
import { z } from "zod";
import { GigStatus, ProposalStatus } from "../enums/gigStatus";

export class ProposalService {
  private proposalRepository: ProposalRepository;
  private gigRepository: GigRepository;

  constructor() {
    this.proposalRepository = new ProposalRepository();
    this.gigRepository = new GigRepository();
  }

  async getAllProposals(
    filter?: Partial<Proposal>,
    page = 1,
    limit = 10
  ): Promise<Proposal[]> {
    const skip = (page - 1) * limit;
    return this.proposalRepository.findAll(filter, skip, limit);
  }

  async getProposalById(id: string): Promise<Proposal | null> {
    return this.proposalRepository.findById(id);
  }

  @Transactional()
  async createProposal(
    proposalData: z.infer<typeof CreateProposalSchema>
  ): Promise<Proposal> {
    try {
      // Validate the input data
      CreateProposalSchema.parse(proposalData);

      // Check if the gig exists and is open
      const gig = await this.gigRepository.findById(proposalData.gigId);
      if (!gig) {
        throw new Error("Gig not found");
      }
      if (gig.status !== GigStatus.OPEN) {
        throw new Error("This gig is not accepting proposals");
      }

      return await this.proposalRepository.createProposal(proposalData);
    } catch (error) {
      logger.error(`Error creating proposal: ${error}`);
      throw error;
    }
  }

  @Transactional()
  async updateProposal(
    id: string,
    proposalData: z.infer<typeof UpdateProposalSchema>
  ): Promise<Proposal | null> {
    try {
      // Validate the input data
      UpdateProposalSchema.parse(proposalData);

      const proposal = await this.proposalRepository.findById(id);
      if (!proposal) {
        throw new Error("Proposal not found");
      }

      // If status is being updated to ACCEPTED, update gig status
      if (proposalData.status === ProposalStatus.ACCEPTED) {
        const gig = await this.gigRepository.findById(proposal.gigId);
        if (gig) {
          await this.gigRepository.updateGig(gig.id, {
            status: GigStatus.IN_PROGRESS,
          });
        }
      }

      return await this.proposalRepository.updateProposal(id, proposalData);
    } catch (error) {
      logger.error(`Error updating proposal ${id}: ${error}`);
      throw error;
    }
  }

  @Transactional()
  async deleteProposal(id: string): Promise<boolean> {
    try {
      return await this.proposalRepository.deleteProposal(id);
    } catch (error) {
      logger.error(`Error deleting proposal ${id}: ${error}`);
      throw error;
    }
  }

  async getProposalsByFreelancerId(freelancerId: string): Promise<Proposal[]> {
    return this.proposalRepository.findByFreelancerId(freelancerId);
  }

  async getProposalsByGigId(gigId: string): Promise<Proposal[]> {
    return this.proposalRepository.findByGigId(gigId);
  }
}
