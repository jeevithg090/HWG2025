import jwt from "jsonwebtoken";
import request from "supertest";
import { createApp } from "../src/app";
import { UserService } from "../src/services/userService";
import { InMemoryUserRepository } from "./inMemoryUserRepository";

const signupBody = {
  name: "Ada Lovelace",
  email: "Ada@Example.com",
  password: "correct-horse",
};

const setup = () => {
  const repo = new InMemoryUserRepository();
  const app = createApp({ userService: new UserService(repo) });
  return { repo, app };
};

const signupAndLogin = async (app: ReturnType<typeof setup>["app"]) => {
  await request(app).post("/user/signup").send(signupBody).expect(201);
  const res = await request(app)
    .post("/user/login")
    .send({ email: signupBody.email, password: signupBody.password })
    .expect(200);
  return res.body.token as string;
};

describe("health", () => {
  it("reports UP on /health and the legacy /healthcheck", async () => {
    const { app } = setup();
    for (const path of ["/health", "/healthcheck"]) {
      const res = await request(app).get(path).expect(200);
      expect(res.body.status).toBe("UP");
    }
  });
});

describe("POST /user/signup", () => {
  it("creates a user with a hashed password and never returns it", async () => {
    const { app, repo } = setup();
    const res = await request(app).post("/user/signup").send(signupBody).expect(201);

    expect(res.body.success).toBe(1);
    expect(res.body.user).toMatchObject({ name: "Ada Lovelace", email: "ada@example.com" });
    expect(res.body.user.password).toBeUndefined();
    expect(repo.rows[0].password).toMatch(/^\$2[aby]\$/);
  });

  it("accepts a role in any casing, including startup", async () => {
    const { app } = setup();
    const res = await request(app)
      .post("/user/signup")
      .send({ ...signupBody, type: "STARTUP" })
      .expect(201);
    expect(res.body.user.type).toBe("startup");
  });

  it("refuses to let users make themselves admin", async () => {
    const { app } = setup();
    const res = await request(app)
      .post("/user/signup")
      .send({ ...signupBody, type: "admin" })
      .expect(400);
    expect(res.body.message).toBe("VALIDATION_ERROR");
  });

  it("ignores fields that are not part of the sign-up contract", async () => {
    const { app, repo } = setup();
    await request(app)
      .post("/user/signup")
      .send({ ...signupBody, roles: ["superuser"], active: false, id: "x" })
      .expect(201);
    expect(repo.rows[0].roles).toBeUndefined();
    expect(repo.rows[0].active).toBe(true);
    expect(repo.rows[0].id).not.toBe("x");
  });

  it("returns 409 when the email is taken (case-insensitively)", async () => {
    const { app } = setup();
    await request(app).post("/user/signup").send(signupBody).expect(201);
    const res = await request(app)
      .post("/user/signup")
      .send({ ...signupBody, email: "ADA@example.com" })
      .expect(409);
    expect(res.body).toEqual({ success: false, message: "USER_EXISTS" });
  });

  it("returns field-level validation errors", async () => {
    const { app } = setup();
    const res = await request(app)
      .post("/user/signup")
      .send({ email: "not-an-email", password: "short" })
      .expect(400);
    const paths = res.body.errors.map((e: { path: string }) => e.path);
    expect(paths).toEqual(expect.arrayContaining(["name", "email", "password"]));
  });

  it("rejects malformed JSON with 400", async () => {
    const { app } = setup();
    const res = await request(app)
      .post("/user/signup")
      .set("Content-Type", "application/json")
      .send("{not json")
      .expect(400);
    expect(res.body.message).toBe("INVALID_JSON");
  });
});

describe("POST /user/login", () => {
  it("returns a JWT containing the public identity", async () => {
    const { app } = setup();
    const token = await signupAndLogin(app);
    const payload = jwt.verify(token, "test-secret") as { user: Record<string, unknown> };
    expect(payload.user).toMatchObject({ email: "ada@example.com", type: "freelancer" });
    expect(payload.user.password).toBeUndefined();
  });

  it("returns 401 for a wrong password or unknown email", async () => {
    const { app } = setup();
    await request(app).post("/user/signup").send(signupBody).expect(201);
    for (const body of [
      { email: signupBody.email, password: "wrong-password" },
      { email: "nobody@example.com", password: "whatever" },
    ]) {
      const res = await request(app).post("/user/login").send(body).expect(401);
      expect(res.body.message).toBe("INVALID_CREDENTIALS");
    }
  });

  it("returns 403 for a disabled account", async () => {
    const { app, repo } = setup();
    await request(app).post("/user/signup").send(signupBody).expect(201);
    repo.rows[0].active = false;
    await request(app)
      .post("/user/login")
      .send({ email: signupBody.email, password: signupBody.password })
      .expect(403);
  });
});

describe("profile and token endpoints", () => {
  it("requires a token", async () => {
    const { app } = setup();
    const res = await request(app).get("/user/profile").expect(401);
    expect(res.body.message).toBe("AUTHENTICATION_REQUIRED");
  });

  it("rejects tampered or foreign tokens", async () => {
    const { app } = setup();
    const forged = jwt.sign({ user: { id: "1", email: "a@b.c" } }, "other-secret");
    await request(app).get("/user/profile").set("Authorization", `Bearer ${forged}`).expect(401);
    await request(app).get("/user/profile").set("Authorization", "Token abc").expect(401);
  });

  it("returns and updates the current user's profile", async () => {
    const { app } = setup();
    const token = await signupAndLogin(app);
    const auth = { Authorization: `Bearer ${token}` };

    const profile = await request(app).get("/user/profile").set(auth).expect(200);
    expect(profile.body.user.email).toBe("ada@example.com");

    const updated = await request(app)
      .patch("/user/profile")
      .set(auth)
      .send({ bio: "Analytical engines", skills: ["math"] })
      .expect(200);
    expect(updated.body.user).toMatchObject({ bio: "Analytical engines", skills: ["math"] });

    // Unknown fields (e.g. trying to change role) are rejected outright.
    await request(app).patch("/user/profile").set(auth).send({ type: "admin" }).expect(400);
  });

  it("verifies tokens on /auth/verify-token", async () => {
    const { app } = setup();
    const token = await signupAndLogin(app);
    const res = await request(app)
      .get("/auth/verify-token")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    expect(res.body.user.email).toBe("ada@example.com");
  });

  it("returns a JSON 404 for unknown routes", async () => {
    const { app } = setup();
    const res = await request(app).get("/nope").expect(404);
    expect(res.body.message).toBe("ROUTE_NOT_FOUND");
  });
});
