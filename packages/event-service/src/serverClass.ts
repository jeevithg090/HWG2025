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
    this.port = config.port || 4002; // Use a different port from user-service
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

    console.log("Connected to Postgres");
  }

  private listen(): void {
    this.app.listen(this.port, () => {
      console.log(`Event Service is running on port ${this.port}`);
    });
  }

  public async start(): Promise<void> {
    await this.connectToDatabase();
    this.listen();
  }
}
