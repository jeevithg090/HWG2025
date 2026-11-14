import request from "supertest";
import { createApp } from "../src/app";
import { bearer, makeUser } from "./helpers";
import { createInMemoryRepositories } from "./inMemoryRepositories";

const gigBody = {
  title: "Build a landing page",
  description: "Need a responsive marketing landing page built in Next.js.",
  budget: 500,
  requiredSkills: ["react", "nextjs"],
};

const proposalBody = (gigId: string) => ({
  gigId,
  coverLetter: "I have shipped a dozen landing pages like this one.",
  bidAmount: 450,
  estimatedTimeInDays: 5,
});

const setup = () => {
  const { repos, tables } = createInMemoryRepositories();
  const app = createApp(repos);
  const client = makeUser("client");
  const freelancer = makeUser("freelancer");
  const rival = makeUser("freelancer", "rival");
  const admin = makeUser("admin");

  const createGig = async (body: object = gigBody, owner = client) =>
    (await request(app).post("/gigs").set(bearer(owner)).send(body).expect(201)).body.data;

  const propose = async (gigId: string, who = freelancer) =>
    (await request(app).post("/proposals").set(bearer(who)).send(proposalBody(gigId)).expect(201))
      .body.data;

  return { app, tables, client, freelancer, rival, admin, createGig, propose };
};

describe("health", () => {
  it("responds", async () => {
    const { app } = setup();
    await request(app).get("/health").expect(200, {
      success: true,
      status: "UP",
      service: "freelance-service",
    });
  });
});

describe("gigs", () => {
  it("requires authentication to create", async () => {
    const { app } = setup();
    const res = await request(app).post("/gigs").send(gigBody).expect(401);
    expect(res.body.message).toBe("AUTHENTICATION_REQUIRED");
  });

  it("takes clientId from the token, not the body", async () => {
    const { client, createGig } = setup();
    const gig = await createGig({ ...gigBody, clientId: "11111111-1111-4111-8111-111111111111" });
    expect(gig.clientId).toBe(client.id);
    expect(gig.status).toBe("open");
  });

  it("does not let freelancers post gigs", async () => {
    const { app, freelancer } = setup();
    const res = await request(app).post("/gigs").set(bearer(freelancer)).send(gigBody).expect(403);
    expect(res.body.message).toBe("GIG_CREATE_FORBIDDEN");
  });

  it("validates input", async () => {
    const { app, client } = setup();
    const res = await request(app)
      .post("/gigs")
      .set(bearer(client))
      .send({ title: "x", description: "short", budget: -1 })
      .expect(400);
    const paths = res.body.errors.map((e: { path: string }) => e.path);
    expect(paths).toEqual(expect.arrayContaining(["title", "description", "budget"]));
  });

  it("lists with pagination and proposal counts", async () => {
    const { app, createGig, propose } = setup();
    const first = await createGig();
    await createGig({ ...gigBody, title: "Second gig here" });
    await propose(first.id);

    const res = await request(app).get("/gigs?page=1&limit=1").expect(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toEqual({ total: 2, page: 1, limit: 1, pages: 2 });

    const detail = await request(app).get(`/gigs/${first.id}`).expect(200);
    expect(detail.body.data.proposalCount).toBe(1);
    expect(detail.body.data.proposals).toBeUndefined();
  });

  it("serves /gigs/search instead of treating 'search' as an id", async () => {
    const { app, createGig } = setup();
    await createGig();
    await createGig({
      title: "Python data pipeline",
      description: "Move nightly CSV exports into a Postgres warehouse.",
      requiredSkills: ["python"],
    });

    const byText = await request(app).get("/gigs/search?query=landing").expect(200);
    expect(byText.body.data.map((g: { title: string }) => g.title)).toEqual([
      "Build a landing page",
    ]);
    const bySkill = await request(app).get("/gigs/search?skills=python,go").expect(200);
    expect(bySkill.body.data).toHaveLength(1);
  });

  it("returns 404 for unknown gigs and 400 for malformed ids", async () => {
    const { app } = setup();
    await request(app).get("/gigs/7d9f1c2e-8b1a-4c3d-9e4f-5a6b7c8d9e0f").expect(404);
    await request(app).get("/gigs/not-a-uuid").expect(400);
  });

  it("only lets the owner (or an admin) update or delete", async () => {
    const { app, createGig, freelancer, admin } = setup();
    const gig = await createGig();

    const denied = await request(app)
      .put(`/gigs/${gig.id}`)
      .set(bearer(freelancer))
      .send({ title: "Hijacked title" })
      .expect(403);
    expect(denied.body.message).toBe("NOT_GIG_OWNER");

    await request(app)
      .put(`/gigs/${gig.id}`)
      .set(bearer(admin))
      .send({ status: "cancelled" })
      .expect(200);
    await request(app).delete(`/gigs/${gig.id}`).set(bearer(freelancer)).expect(403);
    await request(app).delete(`/gigs/${gig.id}`).set(bearer(admin)).expect(200);
    await request(app).get(`/gigs/${gig.id}`).expect(404);
  });
});

describe("proposals", () => {
  it("are private: owner and author can read, others cannot", async () => {
    const { app, client, freelancer, rival, createGig, propose } = setup();
    const gig = await createGig();
    const proposal = await propose(gig.id);
    expect(proposal.freelancerId).toBe(freelancer.id);

    await request(app).get(`/proposals/gig/${gig.id}`).expect(401);
    await request(app).get(`/proposals/gig/${gig.id}`).set(bearer(rival)).expect(403);
    const own = await request(app).get(`/proposals/gig/${gig.id}`).set(bearer(client)).expect(200);
    expect(own.body.data).toHaveLength(1);

    await request(app).get(`/proposals/${proposal.id}`).set(bearer(freelancer)).expect(200);
    await request(app).get(`/proposals/${proposal.id}`).set(bearer(rival)).expect(403);
    await request(app).get(`/proposals/freelancer/${freelancer.id}`).set(bearer(rival)).expect(403);
    await request(app).get("/proposals").set(bearer(client)).expect(403);
  });

  it("lets several freelancers apply but not the gig owner", async () => {
    const { app, client, rival, createGig, propose } = setup();
    const gig = await createGig();
    await propose(gig.id);
    await propose(gig.id, rival);

    const own = await request(app)
      .post("/proposals")
      .set(bearer(client))
      .send(proposalBody(gig.id))
      .expect(400);
    expect(own.body.message).toBe("CANNOT_APPLY_TO_OWN_GIG");
  });

  it("returns 409 when the same freelancer applies twice", async () => {
    const { app, freelancer, createGig, propose } = setup();
    const gig = await createGig();
    await propose(gig.id);
    const res = await request(app)
      .post("/proposals")
      .set(bearer(freelancer))
      .send(proposalBody(gig.id))
      .expect(409);
    expect(res.body.message).toBe("ALREADY_APPLIED");
  });

  it("accepting one proposal starts the gig and rejects the rest", async () => {
    const { app, client, freelancer, rival, createGig, propose } = setup();
    const gig = await createGig();
    const winner = await propose(gig.id, freelancer);
    const loser = await propose(gig.id, rival);

    // Freelancers cannot accept their own bid.
    await request(app)
      .put(`/proposals/${winner.id}`)
      .set(bearer(freelancer))
      .send({ status: "accepted" })
      .expect(403);

    await request(app)
      .put(`/proposals/${winner.id}`)
      .set(bearer(client))
      .send({ status: "accepted" })
      .expect(200);

    const gigAfter = await request(app).get(`/gigs/${gig.id}`).expect(200);
    expect(gigAfter.body.data.status).toBe("in_progress");
    const loserAfter = await request(app).get(`/proposals/${loser.id}`).set(bearer(rival));
    expect(loserAfter.body.data.status).toBe("rejected");

    // The gig is no longer open for new proposals.
    const late = await request(app)
      .post("/proposals")
      .set(bearer(makeUser("freelancer")))
      .send(proposalBody(gig.id))
      .expect(400);
    expect(late.body.message).toBe("GIG_NOT_OPEN");
  });

  it("lets only the author edit content, and only while pending", async () => {
    const { app, client, freelancer, createGig, propose } = setup();
    const gig = await createGig();
    const proposal = await propose(gig.id);

    await request(app)
      .put(`/proposals/${proposal.id}`)
      .set(bearer(client))
      .send({ bidAmount: 1 })
      .expect(403);
    const edited = await request(app)
      .put(`/proposals/${proposal.id}`)
      .set(bearer(freelancer))
      .send({ bidAmount: 400 })
      .expect(200);
    expect(edited.body.data.bidAmount).toBe(400);

    await request(app)
      .put(`/proposals/${proposal.id}`)
      .set(bearer(client))
      .send({ status: "rejected" })
      .expect(200);
    const locked = await request(app)
      .put(`/proposals/${proposal.id}`)
      .set(bearer(freelancer))
      .send({ bidAmount: 300 })
      .expect(400);
    expect(locked.body.message).toBe("PROPOSAL_NOT_EDITABLE");
  });

  it("allows a freelancer to withdraw and re-apply", async () => {
    const { app, freelancer, createGig, propose } = setup();
    const gig = await createGig();
    const proposal = await propose(gig.id);
    await request(app)
      .put(`/proposals/${proposal.id}`)
      .set(bearer(freelancer))
      .send({ status: "withdrawn" })
      .expect(200);
    await propose(gig.id);
  });
});

describe("reviews", () => {
  const completeGig = async (ctx: ReturnType<typeof setup>) => {
    const gig = await ctx.createGig();
    const proposal = await ctx.propose(gig.id);
    await request(ctx.app)
      .put(`/proposals/${proposal.id}`)
      .set(bearer(ctx.client))
      .send({ status: "accepted" })
      .expect(200);
    return gig;
  };

  it("only allows reviews once the gig is completed", async () => {
    const ctx = setup();
    const gig = await completeGig(ctx);
    const res = await request(ctx.app)
      .post("/reviews")
      .set(bearer(ctx.client))
      .send({ gigId: gig.id, revieweeId: ctx.freelancer.id, rating: 5 })
      .expect(400);
    expect(res.body.message).toBe("GIG_NOT_COMPLETED");
  });

  it("lets the two parties review each other once, and computes averages", async () => {
    const ctx = setup();
    const { app, client, freelancer, rival } = ctx;
    const gig = await completeGig(ctx);
    await request(app)
      .put(`/gigs/${gig.id}`)
      .set(bearer(client))
      .send({ status: "completed" })
      .expect(200);

    const review = await request(app)
      .post("/reviews")
      .set(bearer(client))
      .send({ gigId: gig.id, revieweeId: freelancer.id, rating: 4, comment: "Great work" })
      .expect(201);
    expect(review.body.data.reviewerId).toBe(client.id);

    await request(app)
      .post("/reviews")
      .set(bearer(client))
      .send({ gigId: gig.id, revieweeId: freelancer.id, rating: 5 })
      .expect(409);

    // Outsiders cannot review, and you cannot review yourself.
    await request(app)
      .post("/reviews")
      .set(bearer(rival))
      .send({ gigId: gig.id, revieweeId: freelancer.id, rating: 1 })
      .expect(403);
    await request(app)
      .post("/reviews")
      .set(bearer(freelancer))
      .send({ gigId: gig.id, revieweeId: freelancer.id, rating: 5 })
      .expect(400);

    const received = await request(app).get(`/reviews/reviewee/${freelancer.id}`).expect(200);
    expect(received.body.data).toHaveLength(1);
    expect(received.body.averageRating).toBe(4);

    await request(app).delete(`/reviews/${review.body.data.id}`).set(bearer(rival)).expect(403);
    await request(app).delete(`/reviews/${review.body.data.id}`).set(bearer(client)).expect(200);
  });
});

describe("dashboards", () => {
  it("summarises a client's gigs and is private to that client", async () => {
    const { app, client, freelancer, createGig, propose } = setup();
    const gig = await createGig();
    await createGig({ ...gigBody, title: "Another one here" });
    await propose(gig.id);

    await request(app).get(`/dashboard/client/${client.id}`).set(bearer(freelancer)).expect(403);
    const res = await request(app)
      .get(`/dashboard/client/${client.id}`)
      .set(bearer(client))
      .expect(200);
    expect(res.body.data).toMatchObject({
      totalGigs: 2,
      activeGigs: 2,
      completedGigs: 0,
      totalProposalsReceived: 1,
    });
  });

  it("summarises a freelancer's proposals", async () => {
    const { app, freelancer, createGig, propose } = setup();
    await propose((await createGig()).id);
    const res = await request(app)
      .get(`/dashboard/freelancer/${freelancer.id}`)
      .set(bearer(freelancer))
      .expect(200);
    expect(res.body.data).toMatchObject({ totalProposals: 1, pendingProposals: 1 });
  });

  it("restricts platform stats to admins", async () => {
    const { app, client, admin, createGig } = setup();
    await createGig();
    await request(app).get("/dashboard/admin/stats").set(bearer(client)).expect(403);
    const res = await request(app).get("/dashboard/admin/stats").set(bearer(admin)).expect(200);
    expect(res.body.data.totalGigs).toBe(1);
  });
});
