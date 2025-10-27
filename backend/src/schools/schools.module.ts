import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchoolsService } from './schools.service';
import { SchoolsController } from './schools.controller';
import { School } from './entities/school.entity';
import { UsersModule } from '../users/users.module'; // For UserRole access if needed

@Module({
  imports: [
    TypeOrmModule.forFeature([School]),
    UsersModule, // To make UserRole enum available
    // Removed AuthModule import - guards can be used directly without importing the module (DDD: break circular dependency)
  ],
  controllers: [SchoolsController],
  providers: [SchoolsService],
  exports: [SchoolsService], // Export if other modules need to interact with SchoolsService
})
export class SchoolsModule {}
