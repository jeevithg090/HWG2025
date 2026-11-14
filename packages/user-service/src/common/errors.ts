import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import logger from "./logger";

/**
 * An error that maps directly onto an HTTP response.
 * `code` is a stable, machine-readable identifier clients can switch on.
 */
export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message?: string,
  ) {
    super(message ?? code);
    this.name = "AppError";
  }

  static badRequest(code = "BAD_REQUEST", message?: string) {
    return new AppError(400, code, message);
  }
  static unauthorized(code = "UNAUTHORIZED", message?: string) {
    return new AppError(401, code, message);
  }
  static forbidden(code = "FORBIDDEN", message?: string) {
    return new AppError(403, code, message);
  }
  static notFound(code = "NOT_FOUND", message?: string) {
    return new AppError(404, code, message);
  }
  static conflict(code = "CONFLICT", message?: string) {
    return new AppError(409, code, message);
  }
}

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "ROUTE_NOT_FOUND",
    path: req.originalUrl,
  });
};

// Express recognises error handlers by their arity, so `_next` must stay.
export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "VALIDATION_ERROR",
      errors: err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.status).json({ success: false, message: err.code });
    return;
  }

  // Malformed JSON bodies are surfaced by express.json() as SyntaxError with status 400.
  if (err instanceof SyntaxError && (err as { status?: number }).status === 400) {
    res.status(400).json({ success: false, message: "INVALID_JSON" });
    return;
  }

  const message = err instanceof Error ? err.message : String(err);
  logger.error(`${req.method} ${req.originalUrl} failed: ${message}`);
  res.status(500).json({ success: false, message: "INTERNAL_SERVER_ERROR" });
};
