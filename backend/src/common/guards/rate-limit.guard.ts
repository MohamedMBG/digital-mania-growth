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

  // Applied globally as a per-IP DoS backstop. Routes without an explicit
  // @RateLimit fall back to this generous default; auth/payments keep their
  // stricter per-route limits (which override via metadata).
  private static readonly DEFAULT_OPTIONS: RateLimitOptions = {
    windowMs: 60 * 1000,
    maxRequests: 600,
    keyPrefix: "global",
  };

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options =
      this.reflector.getAllAndOverride<RateLimitOptions>(RATE_LIMIT_OPTIONS, [
        context.getHandler(),
        context.getClass(),
      ]) ?? RateLimitGuard.DEFAULT_OPTIONS;

    const http = context.switchToHttp();
    const request = http.getRequest<RateLimitedRequest>();
    const response = http.getResponse<Response>();
    const key = this.buildKey(request, options);
    const record = await this.rateLimitService.consume(key, options.windowMs);
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
    const identifier =
      request.ip || request.socket.remoteAddress || "anonymous";

    return [options.keyPrefix ?? request.route?.path ?? request.path, identifier].join(":");
  }
}
