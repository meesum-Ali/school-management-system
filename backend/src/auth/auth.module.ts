import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { SchoolsModule } from '../schools/schools.module'; // Import SchoolsModule
import { AuthController } from './auth.controller';

@Module({
  imports: [
    UsersModule,
    forwardRef(() => SchoolsModule), // Use forwardRef to handle circular dependency
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'fallback-secret',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
