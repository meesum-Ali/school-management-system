import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { SchoolsModule } from '../schools/schools.module'; // Import SchoolsModule
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    UsersModule,
    SchoolsModule, // Add SchoolsModule to imports
    ConfigModule,
    JwtModule.registerAsync({
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
