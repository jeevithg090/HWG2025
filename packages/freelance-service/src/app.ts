import express, { Request, Response, NextFunction } from "express";
import { gigRoutes } from "./routes/gigRoutes";
import { proposalRoutes } from "./routes/proposalRoutes";
import { reviewRoutes } from "./routes/reviewRoutes";
import { dashboardRoutes } from "./routes/dashboardRoutes";
import logger from "./common/logger";

const app = express();

// Middleware
app.use(express.json());

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "UP", service: "freelance-service" });
});

// API Routes
app.use("/api/gigs", gigRoutes);
app.use("/api/proposals", proposalRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  logger.error(`Error processing request ${req.method} ${req.url}: ${err.message}`);
  
  res.status(500).json({
    status: "error",
    message: "An unexpected error occurred",
  });
});

export default app;
