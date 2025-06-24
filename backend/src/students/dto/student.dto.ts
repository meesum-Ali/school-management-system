import { IsNotEmpty, IsEmail, IsDateString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StudentDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Unique identifier of the student (UUID)' })
  @IsUUID()
  id: string;

  @ApiProperty({ example: 'John', description: 'First name of the student' })
  @IsNotEmpty({ message: 'First name should not be empty' })
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name of the student' })
  @IsNotEmpty({ message: 'Last name should not be empty' })
  lastName: string;

  @ApiProperty({ example: '2005-04-15', description: 'Date of birth of the student (YYYY-MM-DD)' })
  @IsDateString({}, { message: 'Date of birth must be a valid date string (YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'Date of birth should not be empty' })
  dateOfBirth: Date;

  @ApiProperty({ example: 'john.doe@example.com', description: 'Email address of the student' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email should not be empty' })
  email: string;

  @ApiProperty({ example: 'STU20230001', description: 'Unique student ID' })
  @IsNotEmpty({ message: 'Student ID should not be empty' })
  studentId: string;

  @ApiPropertyOptional({ 
    example: '123e4567-e89b-12d3-a456-426614174000', 
    description: 'ID of the class the student belongs to (UUID)',
    nullable: true 
  })
  @IsUUID()
  @IsOptional()
  classId?: string | null;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z', description: 'Date when the student was created' })
  createdAt: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z', description: 'Date when the student was last updated' })
  updatedAt: Date;

  @ApiPropertyOptional({ 
    example: 'Grade 10-A', 
    description: 'Name of the current class the student belongs to',
    nullable: true 
  })
  @IsOptional()
  currentClassName?: string | null;
}

export class CreateStudentDto {
  @ApiProperty({ example: 'John', description: 'First name of the student' })
  @IsNotEmpty({ message: 'First name should not be empty' })
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name of the student' })
  @IsNotEmpty({ message: 'Last name should not be empty' })
  lastName: string;

  @ApiProperty({ example: '2005-04-15', description: 'Date of birth of the student (YYYY-MM-DD)' })
  @IsDateString({}, { message: 'Date of birth must be a valid date string (YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'Date of birth should not be empty' })
  dateOfBirth: Date;

  @ApiProperty({ example: 'john.doe@example.com', description: 'Email address of the student' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email should not be empty' })
  email: string;

  @ApiProperty({ example: 'STU20230001', description: 'Unique student ID' })
  @IsNotEmpty({ message: 'Student ID should not be empty' })
  studentId: string;

  @ApiPropertyOptional({ 
    example: '123e4567-e89b-12d3-a456-426614174000', 
    description: 'ID of the class the student belongs to (UUID)',
    nullable: true 
  })
  @IsUUID()
  @IsOptional()
  classId?: string | null;
}

export class UpdateStudentDto {
  @ApiPropertyOptional({ example: 'John', description: 'Updated first name of the student' })
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe', description: 'Updated last name of the student' })
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ example: '2005-04-15', description: 'Updated date of birth (YYYY-MM-DD)' })
  @IsDateString({}, { message: 'Date of birth must be a valid date string (YYYY-MM-DD)' })
  @IsOptional()
  dateOfBirth?: Date;

  @ApiPropertyOptional({ example: 'john.doe@example.com', description: 'Updated email address' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'STU20230001', description: 'Updated student ID' })
  @IsOptional()
  studentId?: string;

  @ApiPropertyOptional({ 
    example: '123e4567-e89b-12d3-a456-426614174000', 
    description: 'Updated class ID (UUID)',
    nullable: true 
  })
  @IsUUID()
  @IsOptional()
  classId?: string | null;
}
