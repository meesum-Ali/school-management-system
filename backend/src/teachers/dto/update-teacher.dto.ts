import { PartialType } from '@nestjs/mapped-types';
import { CreateTeacherDto } from './create-teacher.dto';
import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateTeacherDto extends PartialType(CreateTeacherDto) {
  @IsString()
  @IsOptional()
  employeeId?: string;

  @IsDateString()
  @IsOptional()
  hireDate?: Date;

  @IsString()
  @IsOptional()
  qualification?: string;

  @IsString()
  @IsOptional()
  specialization?: string;
}
