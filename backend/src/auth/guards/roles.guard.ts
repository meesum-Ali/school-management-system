import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/entities/user.entity'; // Path from backend/src/auth/guards/
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) {
      // If no roles are required by the @Roles() decorator, this guard allows access.
      // Authentication itself should be handled by a separate guard like JwtAuthGuard.
      // If an endpoint is protected by JwtAuthGuard AND RolesGuard,
      // but has no @Roles() decorator, it means any authenticated user can access it.
      return true;
    }
    const { user } = context.switchToHttp().getRequest();

    // user object structure is based on JwtStrategy's validate() method return value.
    // Ensure user object and user.roles exist and user.roles is an array.
    if (!user || !user.roles || !Array.isArray(user.roles)) {
      return false; // Or throw new ForbiddenException('User roles not found or invalid format');
    }

    // Check if any of the user's roles match any of the required roles.
    return requiredRoles.some((role) => user.roles.includes(role));
  }
}
