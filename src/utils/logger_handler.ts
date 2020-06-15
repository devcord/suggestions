import winston from "winston";
const { colorize, combine, label, printf, timestamp } = winston.format;

export class LoggerHandler {
  public logger: winston.Logger;

  constructor() {
    this.logger = this.createLogger();
  }

  private logFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
  });

  createLogger(): winston.Logger {
    const logger = winston.createLogger({
      format: combine(
        colorize(),
        label({ label: process.env.NODE_ENV}),
        timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        this.logFormat,
      ),
      transports: [
        new winston.transports.Console()
      ],
    });

    return logger;
  }
}