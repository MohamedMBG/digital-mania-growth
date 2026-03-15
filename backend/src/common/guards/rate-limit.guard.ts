import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request, Response } from "express";
import {
  RATE_LIMIT_OPTIONS,
  RateLimitOptions,
} from "../rate-limit/rate-limit.decorator";
import { RateLimitService } from "../rate-limit/rate-limit.service";

type RateLimitedRequest = Request & {
  ip?: string;
  socket: { remoteAddress?: string | undefined };
};

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rateLimitService: RateLimitService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const options = this.reflector.getAllAndOverride<RateLimitOptions>(
      RATE_LIMIT_OPTIONS,
      [context.getHandler(), context.getClass()]
    );

    if (!options) {
      return true;
    }

    const http = context.switchToHttp();
    const request = http.getRequest<RateLimitedRequest>();
    const response = http.getResponse<Response>();
    const key = this.buildKey(request, options);
    const record = this.rateLimitService.consume(key, options.windowMs);
    const remaining = Math.max(options.maxRequests - record.count, 0);

    response.setHeader("X-RateLimit-Limit", String(options.maxRequests));
    response.setHeader("X-RateLimit-Remaining", String(remaining));
    response.setHeader("X-RateLimit-Reset", String(Math.ceil(record.resetAt / 1000)));

    if (record.count > options.maxRequests) {
      response.setHeader("Retry-After", String(Math.ceil((record.resetAt - Date.now()) / 1000)));
      throw new HttpException(
        "Too many requests. Please try again shortly.",
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    return true;
  }

  private buildKey(request: RateLimitedRequest, options: RateLimitOptions) {
    const forwardedFor = request.headers["x-forwarded-for"];
    const forwardedIp = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor?.split(",")[0];
    const identifier =
      forwardedIp?.trim() ||
      request.ip ||
      request.socket.remoteAddress ||
      "anonymous";

    return [options.keyPrefix ?? request.route?.path ?? request.path, identifier].join(":");
  }
}
