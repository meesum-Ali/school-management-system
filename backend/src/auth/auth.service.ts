import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { SchoolsService } from '../schools/schools.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly schoolsService: SchoolsService,
    private readonly jwtService: JwtService,
  ) {}

  // Login method for local auth (fallback)
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findOneByUsername(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user;
      return result;
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      schoolId: user.schoolId,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: user,
    };
  }

  // Zitadel token validation happens via ZitadelStrategy
  // This service can be extended for additional auth-related tasks
}
