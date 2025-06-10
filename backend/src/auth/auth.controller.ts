import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService, ValidatedUser } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LocalAuthGuard } from './guards/local-auth.guard'; // Will create this next
import { UserDto } from '../users/dto/user.dto'; // To potentially map the response if needed

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // The LocalAuthGuard will internally use the AuthStrategy (which uses AuthService.validateUser)
  // If validation is successful, it attaches the user object (ValidatedUser) to Request.user
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Request() req: { user: ValidatedUser }): Promise<{ access_token: string }> {
    // req.user is populated by LocalAuthGuard after successful validation by LocalStrategy
    return this.authService.login(req.user);
  }

  // Example: Get current user profile (if JWT auth is set up)
  // @UseGuards(JwtAuthGuard) // Assuming JwtAuthGuard is set up
  // @Get('profile')
  // getProfile(@Request() req) {
  //   return req.user; // req.user would be populated by JwtStrategy
  // }
}
