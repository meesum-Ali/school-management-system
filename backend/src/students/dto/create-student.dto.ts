import { IsString, IsEmail, IsDateString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
}
