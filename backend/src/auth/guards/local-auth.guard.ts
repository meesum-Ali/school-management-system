import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  // You can override methods like canActivate or handleRequest if needed
  // For example, to customize the response on authentication failure.
  // By default, it throws UnauthorizedException.
}
