import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity'; // Import User entity

// Omit password from user object returned by validateUser or login
export type ValidatedUser = Omit<
  User,
  'password' | 'comparePassword' | 'hashPassword'
>;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    // ConfigService is injected into JwtModule.registerAsync now, not directly needed here for secret/expiration
  ) {}

  async validateUser(
    username: string,
    pass: string,
  ): Promise<ValidatedUser | null> {
    const user = await this.usersService.findOneByUsername(username);
    if (user && (await user.comparePassword(pass))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, comparePassword, hashPassword, ...result } = user;
      return result;
    }
    return null;
  }

  // This method is called by AuthController after validateUser is successful
  async login(userPayload: ValidatedUser) {
    // The userPayload here is the result from validateUser (without password)
    // We need roles for the JWT payload if we want to use them in RolesGuard
    const userWithRoles = await this.usersService.findOneEntity(userPayload.id); // Fetch full user for roles
    if (!userWithRoles) {
      throw new UnauthorizedException('User not found after validation.'); // Should not happen
    }

    const payload = {
      username: userWithRoles.username,
      sub: userWithRoles.id,
      roles: userWithRoles.roles, // Include roles in the JWT payload
    };
    return {
      access_token: this.jwtService.sign(payload), // Uses secret and expiration from JwtModule setup
    };
  }

  // Kept if direct token generation is needed elsewhere, but login flow is preferred.
  // Ensure user object passed here is appropriate (e.g., contains id and username)
  generateToken(user: { username: string; id: string; roles: string[] }) {
    const payload = {
      username: user.username,
      sub: user.id,
      roles: user.roles,
    };
    // Secret and expiration are handled by JwtService instance configured in AuthModule
    return this.jwtService.sign(payload);
  }
}
