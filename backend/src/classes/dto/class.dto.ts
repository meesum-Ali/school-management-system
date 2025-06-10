import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubjectDto } from '../../subjects/dto/subject.dto'; // Import SubjectDto
import { IsOptional } from 'class-validator'; // For @IsOptional on DTO field

export class ClassDto {
  @ApiProperty({ example: 'c1d2e3f4-a5b6-7890-1234-567890abcdef', description: 'Unique identifier of the class (UUID)' })
  id: string;

  @ApiProperty({ example: 'Mathematics 10A', description: 'Name of the class' })
  name: string;

  @ApiProperty({ example: 'Grade 10', description: 'Level or grade of the class' })
  level: string;

  @ApiPropertyOptional({ example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', description: 'UUID of the homeroom teacher (User ID)', nullable: true })
  homeroomTeacherId?: string | null;

  @ApiPropertyOptional({ type: () => [SubjectDto], description: 'List of subjects associated with this class' })
  @IsOptional() // This is for class-validator if this DTO were ever used as input, not strictly needed for output
  subjects?: SubjectDto[];

  @ApiProperty({ description: 'Date and time when the class record was created' })
  createdAt: Date;

  @ApiProperty({ description: 'Date and time when the class record was last updated' })
  updatedAt: Date;

  constructor(partial: Partial<ClassDto>) {
    Object.assign(this, partial);
  }
}
