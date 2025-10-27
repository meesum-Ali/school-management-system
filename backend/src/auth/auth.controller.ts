import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Local login endpoint (fallback when Zitadel is not available)
  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Local login with email and password' })
  async login(@Body() loginDto: { email: string; password: string }) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    return this.authService.login(user);
  }

  // Zitadel OAuth flow is handled on the frontend
  // This controller can be extended for token refresh, logout, etc.
}
