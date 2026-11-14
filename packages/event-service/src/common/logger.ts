import { createLogger, format, transports } from "winston";

const SERVICE_NAME = "event-service";

const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  silent: process.env.NODE_ENV === "test",
  defaultMeta: { service: SERVICE_NAME },
  transports: [
    new transports.Console({
      format:
        process.env.NODE_ENV === "production"
          ? format.combine(format.timestamp(), format.json())
          : format.combine(
              format.colorize({ all: true }),
              format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
              format.printf(
                (info) => `${info.timestamp} ${info.level} [${SERVICE_NAME}] ${info.message}`,
              ),
            ),
    }),
  ],
});

export default logger;
