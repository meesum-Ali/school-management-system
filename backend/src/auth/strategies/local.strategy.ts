import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService, ValidatedUser } from '../auth.service';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'username', // or 'email' if you prefer
      // passwordField: 'password' // this is default
    });
  }

  async validate(username: string, password_from_request: string): Promise<ValidatedUser> {
    // passport-local by default takes username and password from request body.
    // Here, 'password_from_request' is the name of the second argument to match passport's expectation.
    const user = await this.authService.validateUser(username, password_from_request);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user; // This user object will be attached to Request.user
  }
}
