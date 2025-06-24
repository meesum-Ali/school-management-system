import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './entities/student.entity';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { ClassesModule } from '../classes/classes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student]),
    ClassesModule // Add this line to import ClassesModule
  ],
  controllers: [StudentsController],
  providers: [StudentsService],
})
export class StudentsModule {}
