import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { ClassBasicDto } from '../../classes/dto/class-basic.dto';

export class SubjectDto {
  @ApiProperty({
    example: 'd1e2f3a4-b5c6-7890-1234-567890abcdef',
    description: 'Unique identifier of the subject (UUID)',
  })
  id: string;

  @ApiProperty({
    example: 'Introduction to Algebra',
    description: 'Name of the subject',
  })
  name: string;

  @ApiPropertyOptional({
    example: 'MATH101',
    description: 'Unique code for the subject',
    nullable: true,
  })
  code?: string | null;

  @ApiPropertyOptional({
    example: 'Basic concepts of algebra for beginners.',
    description: 'Description of the subject',
    nullable: true,
  })
  description?: string | null;

  @ApiPropertyOptional({
    type: () => [ClassBasicDto],
    description: 'List of classes this subject is part of',
  })
  @IsOptional()
  classes?: ClassBasicDto[];

  @ApiProperty({
    description: 'Date and time when the subject record was created',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date and time when the subject record was last updated',
  })
  updatedAt: Date;

  @ApiProperty({
    example: 'uuid-of-a-school',
    description: 'School ID the subject belongs to.',
  })
  schoolId: string;

  constructor(partial: Partial<SubjectDto>) {
    Object.assign(this, partial);
  }
}
