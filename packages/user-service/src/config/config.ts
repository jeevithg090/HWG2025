import dotenv from "dotenv";
dotenv.config();
const env = process.env.NODE_ENV || "development";

export default {
  env: env,
  port: process.env.PORT,
  database: {
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: true,
    logging: false,
    cli: {
      migrationsDir: "src/migrations",
    },
  },
};
