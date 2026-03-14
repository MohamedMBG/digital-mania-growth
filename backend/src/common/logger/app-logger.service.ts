import { ConsoleLogger, Injectable, Scope } from "@nestjs/common";
import * as pino from "pino";

@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger extends ConsoleLogger {
  private readonly stream = pino({
    level: process.env.LOG_LEVEL ?? "debug",
    transport:
      process.env.NODE_ENV !== "production"
        ? {
            target: "pino-pretty",
            options: {
              colorize: true,
              translateTime: "SYS:standard",
            },
          }
        : undefined,
  });

  override log(message: string, context?: string) {
    this.stream.info({ context }, message);
    super.log(message, context);
  }

  override error(message: string, trace?: string, context?: string) {
    this.stream.error({ context, trace }, message);
    super.error(message, trace, context);
  }

  override warn(message: string, context?: string) {
    this.stream.warn({ context }, message);
    super.warn(message, context);
  }

  override debug(message: string, context?: string) {
    this.stream.debug({ context }, message);
    super.debug(message, context);
  }
}
