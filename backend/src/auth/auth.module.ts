import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { SchoolsModule } from '../schools/schools.module'; // Import SchoolsModule
import { AuthController } from './auth.controller';

@Module({
  imports: [
    UsersModule,
    forwardRef(() => SchoolsModule), // Use forwardRef to handle circular dependency
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
