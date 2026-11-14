import dotenv from "dotenv";

dotenv.config();

const env = process.env.NODE_ENV || "development";

const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable ${name}`);
  }
  return value;
};

const parseBoolean = (value: string | undefined, fallback: boolean) =>
  value === undefined ? fallback : ["1", "true", "yes"].includes(value.toLowerCase());

const config = {
  env,
  port: Number(process.env.PORT) || 4000,
  corsOrigins: (process.env.CORS_ORIGIN || "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  database: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_DATABASE || "techcollab",
    // Schema sync keeps local development friction-free. Turn it off once
    // migrations are introduced (DB_SYNCHRONIZE=false).
    synchronize: parseBoolean(process.env.DB_SYNCHRONIZE, true),
    logging: parseBoolean(process.env.DB_LOGGING, false),
  },
  jwtSecret: requireEnv("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h",
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS) || 10,
};

export default config;
