import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config/config";
import { AppError } from "../common/errors";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  type: string;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthUser;
  }
}

const isAuthUser = (value: unknown): value is AuthUser => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.id === "string" && typeof candidate.email === "string";
};

/** Extracts and verifies a `Bearer <jwt>` token, returning the embedded user. */
export const decodeToken = (header: string | undefined): AuthUser => {
  if (!header) {
    throw AppError.unauthorized("AUTHENTICATION_REQUIRED");
  }
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    throw AppError.unauthorized("INVALID_AUTH_HEADER");
  }
  let payload: JwtPayload | string;
  try {
    payload = jwt.verify(token, config.jwtSecret);
  } catch {
    throw AppError.unauthorized("INVALID_TOKEN");
  }
  const user = typeof payload === "object" ? payload.user : undefined;
  if (!isAuthUser(user)) {
    throw AppError.unauthorized("INVALID_TOKEN");
  }
  return user;
};

/** Rejects the request with 401 unless it carries a valid token. */
export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  try {
    req.user = decodeToken(req.headers.authorization);
    next();
  } catch (error) {
    next(error);
  }
};

/** Returns the authenticated user, throwing if `requireAuth` did not run. */
export const currentUser = (req: Request): AuthUser => {
  if (!req.user) {
    throw AppError.unauthorized("AUTHENTICATION_REQUIRED");
  }
  return req.user;
};

export const isAdmin = (user: AuthUser) => user.type === "admin";
