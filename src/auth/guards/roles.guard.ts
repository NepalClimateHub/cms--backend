import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { ROLE } from "../constants/role.constant";
import { ROLES_KEY } from "../decorators/role.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<ROLE[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      return false;
    }

    // Super Admin has access to everything
    if (user.userType === ROLE.SUPER_ADMIN) {
      return true;
    }

    const hasRole = requiredRoles.some((r) => user.userType === r);

    if (!hasRole) {
      throw new UnauthorizedException(
        `User with role ${user.userType} does not have access to this route; required: ${requiredRoles.join(", ")}`,
      );
    }

    return true;
  }
}
