import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassEntity } from './entities/class.entity';
import { ClassesService } from './classes.service';
import { ClassesController } from './classes.controller';
import { SubjectsModule } from '../subjects/subjects.module';
import { UsersModule } from '../users/users.module'; // Import UsersModule
import { ClassScheduleModule } from '../class-schedule/class-schedule.module'; // Import ClassScheduleModule

@Module({
  imports: [
    TypeOrmModule.forFeature([ClassEntity]),
    SubjectsModule, // Import SubjectsModule to make SubjectEntityRepository available
    UsersModule, // Import UsersModule to make UsersService available
    forwardRef(() => ClassScheduleModule), // Handle circular dependency
  ],
  controllers: [ClassesController],
  providers: [ClassesService],
  exports: [
    ClassesService, // Optional: export if other modules will use ClassesService directly
    TypeOrmModule.forFeature([ClassEntity]) // Export the repository to make it available for other modules
  ]
})
export class ClassesModule {}
