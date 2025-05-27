import { addColors, createLogger, format, transports } from "winston";

const { combine, label, timestamp, colorize } = format;

const logger = createLogger({
  level: "info",
  defaultMeta: { service: "event-service" },
  transports: [
    new transports.Console({
      format: combine(
        colorize({
          all: true,
        }),
        label({ label: "[event-service]" }),
        timestamp({
          format: "YY-MM-DD HH:MM:SS",
        }),
        format.printf(
          (info) =>
            `${info.timestamp} ${info.level} ${info.label} ${info.message}`
        )
      ),
    }),
  ],
});

addColors({
  error: "red",
  warn: "yellow",
  info: "cyan",
  debug: "green",
});

export default logger;
