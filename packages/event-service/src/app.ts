import cors from "cors";
import express, { Application, Request, Response } from "express";
import helmet from "helmet";
import config from "./config/config";
import { errorHandler, notFoundHandler } from "./common/errors";
import { typeormRepositories } from "./repository/typeorm";
import { Repositories } from "./repository/types";
import { createEventRouter } from "./routes/eventRoutes";
import { EventService } from "./services/eventService";

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

  const health = (_req: Request, res: Response) => {
    res.json({ success: true, status: "UP", service: "event-service" });
  };
  app.get("/health", health);
  app.get("/healthcheck", health);

  app.use("/events", createEventRouter(new EventService(repos)));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
