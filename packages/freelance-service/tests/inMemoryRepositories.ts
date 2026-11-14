import { randomUUID } from "crypto";
import { GigStatus, ProposalStatus } from "../src/enums/gigStatus";
import { Gig } from "../src/models/gig";
import { Proposal } from "../src/models/proposal";
import { Review } from "../src/models/review";
import { Page, Repositories } from "../src/repository/types";

type Row = { id: string; createdAt: Date; updatedAt: Date; deletedAt?: Date | null };

let clock = 0;
const stamp = () => new Date(Date.UTC(2025, 0, 1) + clock++ * 1000);

/** Generic soft-deleting table used by the in-memory repositories. */
class Table<T extends Row> {
  rows: T[] = [];

  live() {
    return this.rows.filter((row) => !row.deletedAt);
  }

  insert(data: Partial<T>, defaults: Partial<T>): T {
    const now = stamp();
    const row = { ...defaults, ...data, id: randomUUID(), createdAt: now, updatedAt: now } as T;
    this.rows.push(row);
    return { ...row };
  }

  get(id: string) {
    const row = this.live().find((r) => r.id === id);
    return row ? { ...row } : null;
  }

  patch(id: string, changes: Partial<T>) {
    const row = this.live().find((r) => r.id === id);
    if (!row) return null;
    Object.assign(row, changes, { updatedAt: stamp() });
    return { ...row };
  }

  remove(id: string) {
    const row = this.live().find((r) => r.id === id);
    if (!row) return false;
    row.deletedAt = new Date();
    return true;
  }

  query(predicate: (row: T) => boolean, page?: Page): [T[], number] {
    const matches = this.live()
      .filter(predicate)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const sliced = page ? matches.slice(page.skip, page.skip + page.take) : matches;
    return [sliced.map((row) => ({ ...row })), matches.length];
  }
}

const matches = <T>(row: T, filter: Partial<T>) =>
  Object.entries(filter).every(
    ([key, value]) => value === undefined || row[key as keyof T] === value,
  );

export const createInMemoryRepositories = () => {
  const gigs = new Table<Gig>();
  const proposals = new Table<Proposal>();
  const reviews = new Table<Review>();

  const withCounts = (gig: Gig): Gig => ({
    ...gig,
    proposalCount: proposals.live().filter((p) => p.gigId === gig.id).length,
  });

  const repos: Repositories = {
    gigs: {
      async find(filter, page) {
        const [rows, total] = gigs.query((gig) => {
          if (!filter.includeInactive && !gig.isActive) return false;
          if (filter.status && gig.status !== filter.status) return false;
          if (filter.clientId && gig.clientId !== filter.clientId) return false;
          if (filter.query) {
            const q = filter.query.toLowerCase();
            if (!`${gig.title} ${gig.description}`.toLowerCase().includes(q)) return false;
          }
          if (filter.skills?.length) {
            if (!filter.skills.some((s) => gig.requiredSkills?.includes(s))) return false;
          }
          return true;
        }, page);
        return [rows.map(withCounts), total];
      },
      async findById(id) {
        const gig = gigs.get(id);
        if (!gig) return null;
        return { ...withCounts(gig), reviews: reviews.live().filter((r) => r.gigId === id) };
      },
      async create(data) {
        return gigs.insert(data, { status: GigStatus.OPEN, isActive: true } as Partial<Gig>);
      },
      async update(id, changes) {
        return gigs.patch(id, changes);
      },
      async softDelete(id) {
        return gigs.remove(id);
      },
    },
    proposals: {
      async find(filter, page) {
        return proposals.query((p) => matches(p, filter), page);
      },
      async findById(id) {
        return proposals.get(id);
      },
      async create(data) {
        return proposals.insert(data, {
          status: ProposalStatus.PENDING,
          isActive: true,
        } as Partial<Proposal>);
      },
      async update(id, changes) {
        return proposals.patch(id, changes);
      },
      async softDelete(id) {
        return proposals.remove(id);
      },
    },
    reviews: {
      async find(filter, page) {
        return reviews.query((r) => matches(r, filter), page);
      },
      async findById(id) {
        return reviews.get(id);
      },
      async create(data) {
        return reviews.insert(data, {});
      },
      async softDelete(id) {
        return reviews.remove(id);
      },
    },
  };

  return { repos, tables: { gigs, proposals, reviews } };
};
