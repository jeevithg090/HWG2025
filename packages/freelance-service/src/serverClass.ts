import { Application } from "express";
import app from "./app";
import config from "./config/config";
import DatabaseConnection from "./database/database";
import logger from "./common/logger";

export class Server {
  private app: Application;
  private port: string | number;

  constructor() {
    this.app = app;
    this.port = config.port || 4001;
  }

  private async connectToDatabase(): Promise<void> {
    try {
      await DatabaseConnection.connect();
    } catch (error: any) {
      logger.error(
        `[connectToDatabase] Failed to initialize datasource: ${error.message}`
      );
      throw error;
    }

    logger.info("Connected to Postgres");
  }

  private listen(): void {
    this.app.listen(this.port, () => {
      logger.info(`🚀 Freelance service running on port ${this.port}`);
    });
  }

  public async start(): Promise<void> {
    try {
      await this.connectToDatabase();
      this.listen();
    } catch (error: any) {
      logger.error(`Failed to start server: ${error.message}`);
      throw error;
    }
  }
}
