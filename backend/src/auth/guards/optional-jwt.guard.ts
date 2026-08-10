import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AuthenticatedUser } from "../types/authenticated-user.type";

/**
 * Lets a route be called by anonymous visitors while still resolving the user
 * when a valid access token is present. Used by public lead-capture endpoints
 * so a signed-in customer's submission is attached to their account.
 */
@Injectable()
export class OptionalJwtGuard extends AuthGuard("jwt") {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      await super.canActivate(context);
    } catch {
      // Anonymous access is allowed; req.user simply stays undefined.
    }

    return true;
  }

  handleRequest<TUser = AuthenticatedUser>(
    _error: unknown,
    user: TUser | false
  ): TUser | undefined {
    return user || undefined;
  }
}
