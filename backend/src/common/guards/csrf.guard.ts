import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { SKIP_CSRF_KEY } from "../decorators/skip-csrf.decorator";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_CSRF_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skip) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();

    if (SAFE_METHODS.has(request.method)) {
      return true;
    }

    const hasCustomHeader =
      request.headers["x-requested-with"] !== undefined ||
      request.headers["authorization"] !== undefined;

    if (!hasCustomHeader) {
      throw new ForbiddenException(
        "Request blocked: missing required header. Use fetch/XHR with appropriate headers."
      );
    }

    return true;
  }
}
