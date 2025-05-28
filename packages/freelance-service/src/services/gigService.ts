import { GigRepository } from "../repository/gigRepository";
import { Gig } from "../models/gig";
import { CreateGigSchema, UpdateGigSchema } from "../validations/gigValidation";
import logger from "../common/logger";
import { Transactional } from "typeorm-transactional";
import { z } from "zod";

export class GigService {
  private gigRepository: GigRepository;

  constructor() {
    this.gigRepository = new GigRepository();
  }

  async getAllGigs(
    filter?: Partial<Gig>,
    page = 1,
    limit = 10
  ): Promise<Gig[]> {
    const skip = (page - 1) * limit;
    return this.gigRepository.findAll(filter, skip, limit);
  }

  async getGigById(id: string): Promise<Gig | null> {
    return this.gigRepository.findById(id);
  }

  @Transactional()
  async createGig(gigData: z.infer<typeof CreateGigSchema>): Promise<Gig> {
    try {
      // Validate the input data
      CreateGigSchema.parse(gigData);
      // Convert deadline from string to Date if present
      const gigDataToSave = {
        ...gigData,
        deadline: gigData.deadline ? new Date(gigData.deadline) : undefined,
      };
      return await this.gigRepository.createGig(gigDataToSave);
    } catch (error) {
      logger.error(`Error creating gig: ${error}`);
      throw error;
    }
  }

  @Transactional()
  async updateGig(
    id: string,
    gigData: z.infer<typeof UpdateGigSchema>
  ): Promise<Gig | null> {
    try {
      // Validate the input data
      UpdateGigSchema.parse(gigData);
      // Convert deadline from string to Date if present
      const gigDataToUpdate = {
        ...gigData,
        deadline: gigData.deadline ? new Date(gigData.deadline) : undefined,
      };
      return await this.gigRepository.updateGig(id, gigDataToUpdate);
    } catch (error) {
      logger.error(`Error updating gig ${id}: ${error}`);
      throw error;
    }
  }

  @Transactional()
  async deleteGig(id: string): Promise<boolean> {
    try {
      return await this.gigRepository.deleteGig(id);
    } catch (error) {
      logger.error(`Error deleting gig ${id}: ${error}`);
      throw error;
    }
  }

  async getGigsByClientId(clientId: string): Promise<Gig[]> {
    return this.gigRepository.findByClientId(clientId);
  }

  async searchGigs(query: string, skills?: string[]): Promise<Gig[]> {
    return this.gigRepository.searchGigs(query, skills);
  }
}
