import { DataSource } from "typeorm";
import config from "../config/config";
import logger from "../common/logger";
import { User } from "../models/user";

export const dataSource = new DataSource({
  type: "postgres",
  ...config.database,
  entities: [User],
});

export const connectDatabase = async (): Promise<DataSource> => {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
    logger.info("Database connected");
  }
  return dataSource;
};

export const disconnectDatabase = async (): Promise<void> => {
  if (dataSource.isInitialized) {
    await dataSource.destroy();
  }
};
