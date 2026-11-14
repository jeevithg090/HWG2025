import { randomUUID } from "crypto";
import jwt from "jsonwebtoken";
import { AuthUser } from "../src/middleware/auth";

export const makeUser = (type: string, name = type): AuthUser => ({
  id: randomUUID(),
  name,
  email: `${name}-${Math.random().toString(36).slice(2, 8)}@example.com`,
  type,
});

export const bearer = (user: AuthUser) => ({
  Authorization: `Bearer ${jwt.sign({ user }, process.env.JWT_SECRET as string)}`,
});
