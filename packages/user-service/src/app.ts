import cors from "cors";
import express, { Application } from "express";
import helmet from "helmet";
import config from "./config/config";
import { errorHandler, notFoundHandler } from "./common/errors";
import { createAuthRouter } from "./routes/authRoutes";
import { createUserRouter } from "./routes/userRoutes";
import { UserService } from "./services/userService";

export interface AppDependencies {
  userService?: UserService;
}

export const createApp = ({ userService = new UserService() }: AppDependencies = {}): Application => {
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

  const health = (_req: express.Request, res: express.Response) => {
    res.status(200).json({ success: 1, status: "UP", service: "user-service" });
  };
  app.get("/health", health);
  app.get("/healthcheck", health);

  app.use("/user", createUserRouter(userService));
  app.use("/auth", createAuthRouter());

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
