import "reflect-metadata";
import config from "./config/config";
import logger from "./common/logger";
import { createApp } from "./app";
import { connectDatabase, disconnectDatabase } from "./database/database";

const start = async () => {
  await connectDatabase();
  const server = createApp().listen(config.port, () => {
    logger.info(`freelance-service listening on port ${config.port}`);
  });

  const shutdown = (signal: string) => {
    logger.info(`${signal} received, shutting down`);
    server.close(() => {
      disconnectDatabase().finally(() => process.exit(0));
    });
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
};

start().catch((error: unknown) => {
  logger.error(`Failed to start: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
