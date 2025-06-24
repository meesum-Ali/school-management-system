import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
// import { UsersService } from '../../users/users.service'; // Optional: if you need to fetch user from DB on each JWT validation

// Define the shape of the JWT payload after validation
export interface JwtPayload {
  sub: string; // Subject (user ID)
  username: string;
  roles: string[];
  schoolId?: string | null; // Add schoolId (optional, as SUPER_ADMIN might not have one)
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    // private readonly usersService: UsersService, // Optional: Inject UsersService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Default: false. Ensure JWT is not expired.
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    // Passport automatically verifies the JWT signature and expiration based on secretOrKey and ignoreExpiration.
    // This validate method is called if the token is valid.
    // The payload is the decoded JWT.

    // You can optionally fetch the user from the database here to ensure they still exist,
    // are active, or to attach more user information to the request object.
    // const user = await this.usersService.findOneEntity(payload.sub);
    // if (!user || !user.isActive) {
    //   throw new UnauthorizedException('User not found or inactive.');
    // }
    // If you do this, you might return the full user object (or a DTO) instead of just the payload.

    // For stateless JWT authentication, returning the payload is often sufficient.
    // The payload (or a customized user object) will be attached to Request.user.
    // For stateless JWT authentication, returning the payload is often sufficient.
    // The payload (or a customized user object) will be attached to Request.user.
    // Ensure all necessary fields from the JWT are returned here.
    return {
      userId: payload.sub, // Commonly named userId in req.user
      username: payload.username,
      roles: payload.roles,
      schoolId: payload.schoolId, // Add schoolId to be available in req.user
    };
  }
}
