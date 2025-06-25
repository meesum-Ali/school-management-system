import { IsString, IsDateString, IsOptional, IsUUID } from 'class-validator';

export class CreateTeacherDto {
  @IsUUID()
  userId: string;

  @IsString()
  employeeId: string;

  @IsDateString()
  hireDate: Date;

  @IsString()
  @IsOptional()
  qualification?: string;

  @IsString()
  @IsOptional()
  specialization?: string;

  @IsUUID()
  schoolId: string;
}
