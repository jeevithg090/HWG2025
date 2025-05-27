import { DataSource } from "typeorm";
import config from "../config/config";
import {
  addTransactionalDataSource,
  initializeTransactionalContext,
} from "typeorm-transactional";
import logger from "../common/logger";
import { Event } from "../models/event";
import { EventAttendee } from "../models/eventAttendee";

export default class DatabaseConnection {
  private static _instance: DatabaseConnection;
  private _dataSource: DataSource;

  private constructor() {
    this._dataSource = new DataSource({
      ...config.database,
      type: "postgres",
      entities: [Event, EventAttendee],
    });
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection._instance) {
      DatabaseConnection._instance = new DatabaseConnection();
    }
    return DatabaseConnection._instance;
  }

  public async getDataSource(): Promise<DataSource> {
    try {
      if (!this._dataSource.isInitialized) {
        await this._dataSource.initialize();
        initializeTransactionalContext();
        addTransactionalDataSource(this._dataSource);
        logger.info("📦 Event service database connected.");
      }
    } catch (error: any) {
      logger.error(
        `[getDataSource] Failed to initialize datasource: ${error.message}`
      );
      throw error;
    }

    return this._dataSource;
  }

  public static async connect(): Promise<void> {
    try {
      const instance = this.getInstance();
      await instance._dataSource.initialize();
      initializeTransactionalContext();
      addTransactionalDataSource(instance._dataSource);
      logger.info("📦 Event service database connected.");
    } catch (error: any) {
      logger.error(
        `[connect] Failed to initialize datasource: ${error.message}`
      );
      throw error;
    }
  }
}
