import {
  Controller,
  Post,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService, ValidatedUser } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
// import { UserDto } from '../users/dto/user.dto'; // Not directly returned by login

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful, returns JWT access token.',
    schema: { example: { access_token: 'jwt.token.string' } },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid credentials.',
  })
  async login(
    @Request() req: { user: ValidatedUser },
  ): Promise<{ access_token: string }> {
    return this.authService.login(req.user);
  }

  // Example for a profile endpoint if it were added:
  // @UseGuards(JwtAuthGuard)
  // @Get('profile')
  // @ApiBearerAuth() // Indicates this endpoint requires a Bearer token
  // @ApiOperation({ summary: 'Get current user profile' })
  // @ApiResponse({ status: 200, description: 'User profile retrieved successfully.', type: UserDto }) // Assuming UserDto is used for profile
  // @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized - Token missing or invalid.' })
  // getProfile(@Request() req: { user: JwtPayload }) { // JwtPayload from jwt.strategy.ts
  //   // Typically you would fetch full user details using req.user.sub (user ID)
  //   // For this example, just returning the JWT payload
  //   return req.user;
  // }
}
