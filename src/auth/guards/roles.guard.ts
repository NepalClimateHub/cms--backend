import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { ROLE, USER_TYPE } from "../constants/role.constant";
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
    if (user.userType === USER_TYPE.SUPER_ADMIN) {
      return true;
    }

    const hasRole = requiredRoles.some((role) => {
      if (role === ROLE.SUPER_ADMIN && user.userType === USER_TYPE.SUPER_ADMIN)
        return true;
      if (role === ROLE.ADMIN && user.userType === USER_TYPE.ADMIN) return true;
      if (
        role === ROLE.CONTENT_ADMIN &&
        user.userType === USER_TYPE.CONTENT_ADMIN
      )
        return true;
      if (role === ROLE.USER) return true; // Everyone is a user
      return false;
    });

    if (!hasRole) {
      throw new UnauthorizedException(
        `User with type ${user.userType} does not have access to this route with roles ${requiredRoles}`,
      );
    }

    return true;
  }
}
