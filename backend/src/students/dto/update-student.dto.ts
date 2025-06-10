import { IsString, IsEmail, IsDateString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStudentDto {
  @ApiPropertyOptional({ example: 'Janet', description: 'Updated first name of the student' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doer', description: 'Updated last name of the student' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ example: '2005-08-16', description: 'Updated date of birth (YYYY-MM-DD)' })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: Date;

  @ApiPropertyOptional({ example: 'janet.doe@example.com', description: 'Updated email address' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'S1002', description: 'Updated unique student identifier' })
  @IsString()
  @IsOptional()
  studentId?: string;
}
