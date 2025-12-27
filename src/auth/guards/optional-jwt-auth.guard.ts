import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";

import { STRATEGY_JWT_AUTH } from "../constants/strategy.constant";

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard(STRATEGY_JWT_AUTH) {
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Try to authenticate, but don't throw if it fails
    const result = super.canActivate(context);

    if (result instanceof Promise) {
      return result.catch(() => {
        // If authentication fails, allow the request to continue
        // The user will be null in the request context
        return true;
      });
    }

    // If it's a boolean or Observable, return as is
    return result;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  handleRequest(err: any, user: any, info: any) {
    // Don't throw error if user is not authenticated
    // Just return null if authentication fails
    if (err || !user) {
      return null;
    }
    return user;
  }
}
