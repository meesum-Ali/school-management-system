import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService, ValidatedUser } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'username',
      passwordField: 'password', // Explicitly stating, though it's default
      passReqToCallback: true, // Pass the request object to the validate method
    });
  }

  async validate(
    req: any, // Express request object
    username: string,
    password_from_request: string,
  ): Promise<ValidatedUser> {
    const schoolIdentifier = req.body.schoolIdentifier; // Extract schoolIdentifier from request body

    const user = await this.authService.validateUser(
      username,
      password_from_request,
      schoolIdentifier, // Pass it to the service
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user; // This user object will be attached to Request.user
  }
}
