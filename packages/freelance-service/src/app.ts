import cors from "cors";
import express, { Application, Request, Response } from "express";
import helmet from "helmet";
import config from "./config/config";
import { errorHandler, notFoundHandler } from "./common/errors";
import { typeormRepositories } from "./repository/typeorm";
import { Repositories } from "./repository/types";
import { createDashboardRouter } from "./routes/dashboardRoutes";
import { createGigRouter } from "./routes/gigRoutes";
import { createProposalRouter } from "./routes/proposalRoutes";
import { createReviewRouter } from "./routes/reviewRoutes";
import { DashboardService } from "./services/dashboardService";
import { GigService } from "./services/gigService";
import { ProposalService } from "./services/proposalService";
import { ReviewService } from "./services/reviewService";

export const createApp = (repos: Repositories = typeormRepositories): Application => {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(
    cors({
      origin: config.corsOrigins,
      methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "100kb" }));

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ success: true, status: "UP", service: "freelance-service" });
  });

  app.use("/gigs", createGigRouter(new GigService(repos.gigs)));
  app.use("/proposals", createProposalRouter(new ProposalService(repos.proposals, repos.gigs)));
  app.use("/reviews", createReviewRouter(new ReviewService(repos)));
  app.use("/dashboard", createDashboardRouter(new DashboardService(repos)));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
