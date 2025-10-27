import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassSchedule } from './entities/class-schedule.entity';
import { ClassScheduleService } from './class-schedule.service';
import { ClassScheduleController } from './class-schedule.controller';
import { ClassesModule } from '../classes/classes.module';
import { TeachersModule } from '../teachers/teachers.module';
import { SubjectsModule } from '../subjects/subjects.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClassSchedule]),
    ClassesModule, // Import modules to access their services (DDD: proper module boundaries)
    TeachersModule,
    SubjectsModule,
    // Removed forwardRef - circular dependency resolved (DDD: unidirectional dependencies)
  ],
  controllers: [ClassScheduleController],
  providers: [ClassScheduleService],
  exports: [ClassScheduleService],
})
export class ClassScheduleModule {}
