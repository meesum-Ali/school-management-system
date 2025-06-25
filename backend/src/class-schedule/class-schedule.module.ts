import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassSchedule } from './entities/class-schedule.entity';
import { ClassScheduleService } from './class-schedule.service';
import { ClassScheduleController } from './class-schedule.controller';
import { ClassEntity } from '../classes/entities/class.entity';
import { SubjectEntity } from '../subjects/entities/subject.entity';
import { Teacher } from '../teachers/entities/teacher.entity';
import { User } from '../users/entities/user.entity';
import { ClassesModule } from '../classes/classes.module';
import { TeachersModule } from '../teachers/teachers.module';
import { SubjectsModule } from '../subjects/subjects.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClassSchedule,
      ClassEntity,
      SubjectEntity,
      Teacher,
      User,
    ]),
    forwardRef(() => ClassesModule),
    forwardRef(() => TeachersModule),
    forwardRef(() => SubjectsModule),
  ],
  controllers: [ClassScheduleController],
  providers: [ClassScheduleService],
  exports: [ClassScheduleService],
})
export class ClassScheduleModule {}
