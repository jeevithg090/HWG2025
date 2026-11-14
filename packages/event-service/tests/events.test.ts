import request from "supertest";
import { createApp } from "../src/app";
import { bearer, makeUser } from "./helpers";
import { createInMemoryRepositories } from "./inMemoryRepositories";

const inDays = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString();

const eventBody = (overrides: object = {}) => ({
  title: "Open Source Hack Night",
  description: "An evening of hacking on open source projects together.",
  startDateTime: inDays(7),
  endDateTime: inDays(7.2),
  venue: "Community Hall",
  eventType: "HACKATHON",
  ...overrides,
});

const setup = () => {
  const { repos } = createInMemoryRepositories();
  const app = createApp(repos);
  const organizer = makeUser("client", "organizer");
  const createEvent = async (overrides: object = {}) =>
    (
      await request(app)
        .post("/events")
        .set(bearer(organizer))
        .send(eventBody(overrides))
        .expect(201)
    ).body.event;
  const register = (eventId: string, user = makeUser("freelancer")) =>
    request(app).post(`/events/${eventId}/register`).set(bearer(user));
  return { app, organizer, createEvent, register };
};

describe("event CRUD", () => {
  it("requires auth to create and assigns the organizer from the token", async () => {
    const { app, organizer, createEvent } = setup();
    await request(app).post("/events").send(eventBody()).expect(401);

    const event = await createEvent({ organizerId: "11111111-1111-4111-8111-111111111111" });
    expect(event.organizerId).toBe(organizer.id);
    expect(event.isPublished).toBe(true);
    expect(event.currentAttendees).toBe(0);
  });

  it("validates dates, links and types", async () => {
    const { app, organizer } = setup();
    const res = await request(app)
      .post("/events")
      .set(bearer(organizer))
      .send(
        eventBody({
          startDateTime: "not a date",
          onlineLink: "nope",
          eventType: "PARTY",
        }),
      )
      .expect(400);
    const paths = res.body.errors.map((e: { path: string }) => e.path);
    expect(paths).toEqual(expect.arrayContaining(["startDateTime", "onlineLink", "eventType"]));

    const backwards = await request(app)
      .post("/events")
      .set(bearer(organizer))
      .send(eventBody({ startDateTime: inDays(3), endDateTime: inDays(2) }))
      .expect(400);
    expect(backwards.body.errors[0].path).toBe("endDateTime");
  });

  it("hides drafts from the public but shows them to their organizer", async () => {
    const { app, organizer, createEvent } = setup();
    await createEvent();
    const draft = await createEvent({ title: "Secret draft event", isPublished: false });

    const pub = await request(app).get("/events").expect(200);
    expect(pub.body.events).toHaveLength(1);
    expect(pub.body.pagination).toEqual({ total: 1, page: 1, limit: 10, pages: 1 });
    await request(app).get(`/events/${draft.id}`).expect(404);

    const mine = await request(app)
      .get(`/events?organizerId=${organizer.id}`)
      .set(bearer(organizer))
      .expect(200);
    expect(mine.body.events).toHaveLength(2);
    await request(app).get(`/events/${draft.id}`).set(bearer(organizer)).expect(200);
  });

  it("filters by type and paginates", async () => {
    const { app, createEvent } = setup();
    await createEvent();
    await createEvent({ eventType: "WEBINAR", title: "Webinar one" });
    await createEvent({ eventType: "WEBINAR", title: "Webinar two" });

    const res = await request(app).get("/events?eventType=WEBINAR&limit=1&page=2").expect(200);
    expect(res.body.events).toHaveLength(1);
    expect(res.body.pagination).toMatchObject({ total: 2, pages: 2, page: 2 });
    await request(app).get("/events?limit=0").expect(400);
  });

  it("only lets the organizer update or delete, and keeps eventType on partial updates", async () => {
    const { app, organizer, createEvent } = setup();
    const event = await createEvent();
    const stranger = makeUser("freelancer");

    await request(app)
      .put(`/events/${event.id}`)
      .set(bearer(stranger))
      .send({ title: "Hijacked" })
      .expect(403);
    const updated = await request(app)
      .put(`/events/${event.id}`)
      .set(bearer(organizer))
      .send({ title: "Renamed hack night" })
      .expect(200);
    expect(updated.body.event).toMatchObject({
      title: "Renamed hack night",
      eventType: "HACKATHON",
    });

    await request(app).delete(`/events/${event.id}`).set(bearer(stranger)).expect(403);
    await request(app).delete(`/events/${event.id}`).set(bearer(organizer)).expect(200);
    await request(app).get(`/events/${event.id}`).expect(404);
  });

  it("does not expose attendee details on the public event page", async () => {
    const { app, createEvent, register } = setup();
    const event = await createEvent();
    await register(event.id).expect(200);
    const res = await request(app).get(`/events/${event.id}`).expect(200);
    expect(res.body.event.attendees).toBeUndefined();
    expect(res.body.event.currentAttendees).toBe(1);
  });
});

describe("registration", () => {
  it("registers with identity from the token and rejects duplicates", async () => {
    const { createEvent, register } = setup();
    const event = await createEvent();
    const user = makeUser("freelancer", "Grace");

    const res = await register(event.id, user).expect(200);
    expect(res.body.message).toBe("SUCCESSFULLY_REGISTERED");
    expect(res.body.attendee).toMatchObject({ userId: user.id, userEmail: user.email });

    const dup = await register(event.id, user).expect(409);
    expect(dup.body.message).toBe("ALREADY_REGISTERED");
  });

  it("waitlists when full and promotes the first waitlisted user on cancellation", async () => {
    const { app, organizer, createEvent, register } = setup();
    const event = await createEvent({ maxAttendees: 1 });
    const [first, second, third] = [makeUser("a"), makeUser("b"), makeUser("c")];

    await register(event.id, first).expect(200);
    expect((await register(event.id, second)).body.message).toBe("ADDED_TO_WAITLIST");
    expect((await register(event.id, third)).body.message).toBe("ADDED_TO_WAITLIST");

    await request(app).post(`/events/${event.id}/cancel`).set(bearer(first)).expect(200);

    const list = await request(app)
      .get(`/events/${event.id}/attendees`)
      .set(bearer(organizer))
      .expect(200);
    const statusOf = (id: string) =>
      list.body.attendees.find((a: { userId: string }) => a.userId === id).status;
    expect(statusOf(first.id)).toBe("CANCELLED");
    expect(statusOf(second.id)).toBe("REGISTERED");
    expect(statusOf(third.id)).toBe("WAITLISTED");

    const after = await request(app).get(`/events/${event.id}`).expect(200);
    expect(after.body.event.currentAttendees).toBe(1);
  });

  it("promotes waitlisted users when capacity is raised", async () => {
    const { app, organizer, createEvent, register } = setup();
    const event = await createEvent({ maxAttendees: 1 });
    await register(event.id).expect(200);
    await register(event.id).expect(200);

    const res = await request(app)
      .put(`/events/${event.id}`)
      .set(bearer(organizer))
      .send({ maxAttendees: 2 })
      .expect(200);
    expect(res.body.event.currentAttendees).toBe(2);
  });

  it("lets a user register again after cancelling", async () => {
    const { app, createEvent, register } = setup();
    const event = await createEvent();
    const user = makeUser("freelancer");
    await register(event.id, user).expect(200);
    await request(app).post(`/events/${event.id}/cancel`).set(bearer(user)).expect(200);
    await request(app).post(`/events/${event.id}/cancel`).set(bearer(user)).expect(404);
    const again = await register(event.id, user).expect(200);
    expect(again.body.message).toBe("SUCCESSFULLY_REGISTERED");
  });

  it("refuses registration for drafts and past events", async () => {
    const { createEvent, register } = setup();
    const draft = await createEvent({ isPublished: false });
    expect((await register(draft.id).expect(400)).body.message).toBe("EVENT_NOT_AVAILABLE");

    const past = await createEvent({ startDateTime: inDays(-2), endDateTime: inDays(-1) });
    expect((await register(past.id).expect(400)).body.message).toBe("EVENT_ENDED");
  });

  it("restricts attendee management to the organizer", async () => {
    const { app, organizer, createEvent, register } = setup();
    const event = await createEvent();
    const attendee = (await register(event.id).expect(200)).body.attendee;
    const stranger = makeUser("freelancer");

    await request(app).get(`/events/${event.id}/attendees`).set(bearer(stranger)).expect(403);
    await request(app)
      .post(`/events/attendees/${attendee.id}/mark-attendance`)
      .set(bearer(stranger))
      .expect(403);
    const marked = await request(app)
      .post(`/events/attendees/${attendee.id}/mark-attendance`)
      .set(bearer(organizer))
      .send({ hasAttended: true })
      .expect(200);
    expect(marked.body.attendee.hasAttended).toBe(true);
  });

  it("lists a user's own registrations only", async () => {
    const { app, createEvent, register } = setup();
    const event = await createEvent();
    const user = makeUser("freelancer");
    await register(event.id, user).expect(200);

    await request(app)
      .get(`/events/user/${user.id}`)
      .set(bearer(makeUser("x")))
      .expect(403);
    const res = await request(app).get(`/events/user/${user.id}`).set(bearer(user)).expect(200);
    expect(res.body.events).toHaveLength(1);
    expect(res.body.events[0].event.title).toBe("Open Source Hack Night");
  });
});
