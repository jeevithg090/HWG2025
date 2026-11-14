import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  computeProposalStats,
  countGigsByStatus,
  fetchClientProjects,
  fetchProjects,
  filterGigs,
  matchesBudgetRange,
  totalBudget,
} from "@/lib/dashboard-helpers";
import type { Gig, Proposal } from "@/lib/types";

const gig = (overrides: Partial<Gig>): Gig => ({
  id: "g",
  title: "Build a React dashboard",
  description: "Need charts and auth",
  clientId: "c1",
  status: "open",
  ...overrides,
});

const proposal = (overrides: Partial<Proposal>): Proposal => ({
  id: "p",
  freelancerId: "f1",
  gigId: "g",
  coverLetter: "I can do it",
  bidAmount: 100,
  status: "pending",
  ...overrides,
});

describe("budget and search filters", () => {
  it("matches budget ranges, including string amounts", () => {
    expect(matchesBudgetRange(500, "under-1k")).toBe(true);
    expect(matchesBudgetRange("1000", "1k-5k")).toBe(true);
    expect(matchesBudgetRange(7000, "5k-10k")).toBe(true);
    expect(matchesBudgetRange(20000, "over-10k")).toBe(true);
    expect(matchesBudgetRange(20000, "under-1k")).toBe(false);
    expect(matchesBudgetRange(null, "all")).toBe(true);
    expect(matchesBudgetRange(null, "under-1k")).toBe(false);
  });

  it("filters by title, description and skills", () => {
    const gigs = [
      gig({ id: "1", requiredSkills: ["TypeScript"], budget: 800 }),
      gig({ id: "2", title: "Logo design", description: "Branding", budget: 3000 }),
    ];
    expect(filterGigs(gigs, "typescript", "all").map((g) => g.id)).toEqual(["1"]);
    expect(filterGigs(gigs, "BRAND", "all").map((g) => g.id)).toEqual(["2"]);
    expect(filterGigs(gigs, "", "1k-5k").map((g) => g.id)).toEqual(["2"]);
    expect(filterGigs(gigs, "  ", "all")).toHaveLength(2);
  });
});

describe("stats", () => {
  it("computes proposal stats", () => {
    const stats = computeProposalStats([
      proposal({ status: "pending" }),
      proposal({ status: "accepted", bidAmount: "250.50" }),
      proposal({ status: "accepted", bidAmount: 100 }),
      proposal({ status: "rejected" }),
      proposal({ status: "withdrawn" }),
    ]);
    expect(stats).toEqual({
      total: 5,
      pending: 1,
      accepted: 2,
      rejected: 1,
      successRate: 67,
      acceptedValue: 350.5,
    });
    expect(computeProposalStats([]).successRate).toBe(0);
  });

  it("counts gigs by status and totals budgets", () => {
    const gigs = [
      gig({ status: "open", budget: 100 }),
      gig({ status: "completed", budget: "50" }),
      gig({ status: "open" }),
    ];
    expect(countGigsByStatus(gigs)).toEqual({
      open: 2,
      in_progress: 0,
      completed: 1,
      cancelled: 0,
    });
    expect(totalBudget(gigs)).toBe(150);
  });
});

describe("loaders", () => {
  const fetchMock = vi.fn<typeof fetch>();
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("returns data on success", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true, data: [gig({ id: "x" })] })),
    );
    const result = await fetchProjects();
    expect(result.error).toBeNull();
    expect(result.data.map((g) => g.id)).toEqual(["x"]);
  });

  it("returns an error message and empty data on failure", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ success: false, message: "Server down" }), { status: 500 }),
    );
    const result = await fetchClientProjects("c1");
    expect(result).toEqual({ data: [], error: "Server down" });
  });
});
