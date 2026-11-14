import { AppError } from "../common/errors";
import { AuthUser, isAdmin } from "../middleware/auth";
import { Gig } from "../models/gig";
import { GigFilter, GigRepository } from "../repository/types";
import { CreateGigInput, Pagination, UpdateGigInput } from "../validations/schemas";
import { paginate, Paginated, toPage } from "./pagination";

/** Account types allowed to post gigs. */
const GIG_POSTER_TYPES = new Set(["client", "startup", "admin"]);

export class GigService {
  constructor(private readonly gigs: GigRepository) {}

  async list(filter: GigFilter, pagination: Pagination): Promise<Paginated<Gig>> {
    return paginate(await this.gigs.find(filter, toPage(pagination)), pagination);
  }

  async listByClient(clientId: string): Promise<Gig[]> {
    const [gigs] = await this.gigs.find({ clientId, includeInactive: true });
    return gigs;
  }

  async get(id: string): Promise<Gig> {
    const gig = await this.gigs.findById(id);
    if (!gig) throw AppError.notFound("GIG_NOT_FOUND");
    return gig;
  }

  async create(user: AuthUser, input: CreateGigInput): Promise<Gig> {
    if (!GIG_POSTER_TYPES.has(user.type)) {
      throw AppError.forbidden("GIG_CREATE_FORBIDDEN");
    }
    return this.gigs.create({
      ...input,
      clientId: user.id,
      deadline: input.deadline ? new Date(input.deadline) : undefined,
    });
  }

  async update(user: AuthUser, id: string, input: UpdateGigInput): Promise<Gig> {
    await this.getOwned(user, id);
    const { deadline, ...rest } = input;
    const changes: Partial<Gig> = { ...rest };
    if (deadline !== undefined) changes.deadline = new Date(deadline);
    const updated = await this.gigs.update(id, changes);
    if (!updated) throw AppError.notFound("GIG_NOT_FOUND");
    return updated;
  }

  async remove(user: AuthUser, id: string): Promise<void> {
    await this.getOwned(user, id);
    await this.gigs.softDelete(id);
  }

  /** Loads a gig and asserts the user owns it (admins may act on any gig). */
  async getOwned(user: AuthUser, id: string): Promise<Gig> {
    const gig = await this.get(id);
    if (gig.clientId !== user.id && !isAdmin(user)) {
      throw AppError.forbidden("NOT_GIG_OWNER");
    }
    return gig;
  }
}
