import dotenv from "dotenv";
dotenv.config();
const env = process.env.NODE_ENV || "development";

export default {
  env: env,
  port: process.env.PORT || 4002,
  database: {
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_DATABASE || "eventservice",
    synchronize: true,
    logging: false,
    cli: {
      migrationsDir: "src/migrations",
    },
  },
};
