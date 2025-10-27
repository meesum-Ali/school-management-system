import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassEntity } from './entities/class.entity';
import { ClassesService } from './classes.service';
import { ClassesController } from './classes.controller';
import { SubjectsModule } from '../subjects/subjects.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClassEntity]),
    SubjectsModule, // Import SubjectsModule to access SubjectsService (DDD: proper module boundaries)
    UsersModule, // Import UsersModule to make UsersService available
    // Removed ClassScheduleModule - not needed by ClassesService (DDD: break circular dependency)
  ],
  controllers: [ClassesController],
  providers: [ClassesService],
  exports: [
    ClassesService, // Export service for other modules to use (DDD: service layer communication)
    TypeOrmModule.forFeature([ClassEntity]), // Export the repository to make it available for other modules
  ],
})
export class ClassesModule {}
