import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  // The login endpoint is no longer needed as Keycloak handles the authentication process.
  // This controller can be used for other authentication-related endpoints in the future.
}
