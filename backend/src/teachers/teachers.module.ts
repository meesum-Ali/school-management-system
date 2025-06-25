import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Teacher } from './entities/teacher.entity';
import { TeachersService } from './teachers.service';
import { TeachersController } from './teachers.controller';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Teacher, User])],
  controllers: [TeachersController],
  providers: [TeachersService],
  exports: [TeachersService],
})
export class TeachersModule {}
