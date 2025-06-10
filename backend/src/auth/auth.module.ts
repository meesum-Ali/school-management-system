import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module'; // To access UsersService
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy'; // Will create this for JWT validation
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    UsersModule, // Import UsersModule to use UsersService
    ConfigModule, // Ensure ConfigModule is available for JwtService setup
    JwtModule.registerAsync({
      imports: [ConfigService], // Import ConfigService here if using it for JWT options
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRATION') || '3600s' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy], // JwtStrategy for validating JWTs on protected routes
  controllers: [AuthController],       // AuthController for login endpoint
  exports: [AuthService],             // Export AuthService if other modules need to generate tokens (unlikely)
})
export class AuthModule {}
