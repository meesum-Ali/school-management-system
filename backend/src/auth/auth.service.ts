import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { SchoolsService } from '../schools/schools.service'; // Import SchoolsService

// Omit password from user object returned by validateUser or login
// Include schoolId if present
export type ValidatedUser = Omit<
  User,
  'password' | 'comparePassword' | 'hashPassword'
>;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly schoolsService: SchoolsService, // Inject SchoolsService
  ) {}

  async validateUser(
    username: string,
    pass: string,
    schoolIdentifier?: string,
  ): Promise<ValidatedUser | null> {
    let user: User | undefined;

    if (schoolIdentifier) {
      const school = await this.schoolsService.findByDomain(schoolIdentifier); // Or find by another unique school code
      if (!school) {
        // School not found by identifier, could log this or throw specific error if needed
        // but for validateUser, returning null is often preferred to avoid leaking info.
        return null;
      }
      user = await this.usersService.findOneByUsername(username, school.id);
    } else {
      // Attempt to find a global user (schoolId is null)
      // Or, if your system allows users to log in without specifying a school first,
      // and usernames are globally unique, this might find them.
      // However, with school-scoped usernames, this path is mainly for SUPER_ADMIN or similar.
      user = await this.usersService.findOneByUsername(username, null); // Explicitly null for global users
    }

    if (user && (await user.comparePassword(pass))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, comparePassword, hashPassword, ...result } = user;
      return result as ValidatedUser; // Cast because 'schoolId' is now part of User, thus part of result
    }
    return null;
  }

  // This method is called by AuthController after validateUser is successful
  async login(userPayload: ValidatedUser & { schoolId?: string | null }) {
    // The userPayload here is the result from validateUser (without password)
    // We need roles for the JWT payload if we want to use them in RolesGuard
    const userWithRoles = await this.usersService.findOneEntity(userPayload.id); // Fetch full user for roles
    if (!userWithRoles) {
      throw new UnauthorizedException('User not found after validation.'); // Should not happen
    }

    // Get roles and ensure it's an array of strings
    let roles: string[] = [];
    
    // Handle different possible formats of roles
    if (Array.isArray(userWithRoles.roles)) {
      // If it's already an array, ensure each item is a string
      roles = userWithRoles.roles.map(role => {
        if (typeof role === 'string') {
          // Remove any curly braces and trim
          return role.replace(/[{}]/g, '').trim();
        }
        return String(role).trim();
      });
    } else if (typeof userWithRoles.roles === 'string') {
      // If it's a string, try to parse it as JSON
      try {
        const parsed = JSON.parse(userWithRoles.roles);
        if (Array.isArray(parsed)) {
          roles = parsed.map(r => String(r).trim());
        } else if (parsed) {
          roles = [String(parsed).trim()];
        }
      } catch (e) {
        // If not valid JSON, try to split by comma or use as single role
        const roleStr = String(userWithRoles.roles).replace(/[{}]/g, '').trim();
        roles = roleStr ? roleStr.split(',').map(r => r.trim()) : [];
      }
    }
    
    // Ensure we have at least one role
    if (roles.length === 0) {
      roles = ['USER'];
    }
    
    // Log the roles for debugging
    console.log('User roles after processing:', roles);

    const payload = {
      username: userWithRoles.username,
      sub: userWithRoles.id,
      roles: roles, // This should now be a proper string array
      schoolId: userWithRoles.schoolId,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // Kept if direct token generation is needed elsewhere, but login flow is preferred.
  // Ensure user object passed here is appropriate (e.g., contains id, username, roles, schoolId)
  generateToken(user: { username: string; id: string; roles: string[]; schoolId?: string | null }) {
    const payload = {
      username: user.username,
      sub: user.id,
      roles: user.roles,
      schoolId: user.schoolId,
    };
    return this.jwtService.sign(payload);
  }
}
