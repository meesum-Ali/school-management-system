import { ApiProperty } from '@nestjs/swagger';

export class StudentDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Unique identifier of the student (UUID)' })
  id: string;

  @ApiProperty({ example: 'Jane', description: 'First name of the student' })
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name of the student' })
  lastName: string;

  @ApiProperty({ example: '2005-08-15T00:00:00.000Z', description: 'Date of birth of the student' })
  dateOfBirth: Date;

  @ApiProperty({ example: 'jane.doe@example.com', description: 'Email address of the student' })
  email: string;

  @ApiProperty({ example: 'S1001', description: 'Unique student identifier' })
  studentId: string;

  @ApiProperty({ description: 'Date and time when the student record was created' })
  createdAt: Date;

  @ApiProperty({ description: 'Date and time when the student record was last updated' })
  updatedAt: Date;

  constructor(partial: Partial<StudentDto>) {
    Object.assign(this, partial);
  }
}
