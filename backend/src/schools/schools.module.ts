import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchoolsService } from './schools.service';
import { SchoolsController } from './schools.controller';
import { School } from './entities/school.entity';
import { UsersModule } from '../users/users.module'; // For UserRole access if needed, and future admin user linking
import { AuthModule } from '../auth/auth.module'; // For guards

@Module({
  imports: [
    TypeOrmModule.forFeature([School]),
    UsersModule, // To make UserRole enum available and potentially UsersService
    forwardRef(() => AuthModule), // Use forwardRef to handle circular dependency
  ],
  controllers: [SchoolsController],
  providers: [SchoolsService],
  exports: [SchoolsService], // Export if other modules need to interact with SchoolsService
})
export class SchoolsModule {}
