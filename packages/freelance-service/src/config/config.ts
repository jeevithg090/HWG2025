// src/config/config.ts
const env = process.env.NODE_ENV || "development";

interface Config {
  port: number;
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    synchronize: boolean;
    logging: boolean;
  };
}

const config: Record<string, Config> = {
  development: {
    port: Number(process.env.PORT) || 4001,
    database: {
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || "postgres",
      password: process.env.DB_PASSWORD || "postgres",
      database: process.env.DB_DATABASE || "freelance_service_db",
      synchronize: false,
      logging: true,
    },
  },
  production: {
    port: Number(process.env.PORT) || 4001,
    database: {
      host: process.env.DB_HOST || "postgres",
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || "postgres",
      password: process.env.DB_PASSWORD || "postgres",
      database: process.env.DB_DATABASE || "freelance_service_db",
      synchronize: false, // Don't auto-synchronize in production
      logging: false,
    },
  },
  test: {
    port: Number(process.env.PORT) || 4001,
    database: {
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || "postgres",
      password: process.env.DB_PASSWORD || "postgres",
      database: process.env.DB_DATABASE || "freelance_service_test_db",
      synchronize: false,
      logging: false,
    },
  },
};

export default config[env];
