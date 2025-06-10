import { IsString, IsEmail, IsDateString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStudentDto {
  @ApiProperty({ example: 'Jane', description: 'First name of the student' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name of the student' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: '2005-08-15', description: 'Date of birth of the student (YYYY-MM-DD)' })
  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: Date; // TypeORM will handle conversion from string if needed, validation ensures it's a date string

  @ApiProperty({ example: 'jane.doe@example.com', description: 'Email address of the student' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'S1001', description: 'Unique student identifier' })
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @ApiPropertyOptional({ example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', description: 'ID of the class to enroll the student in (optional)' })
  @IsUUID()
  @IsOptional()
  classId?: string | null;
}
