import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ClassBasicDto {
  @ApiProperty({
    example: 'c1d2e3f4-a5b6-7890-1234-567890abcdef',
    description: 'Unique identifier of the class (UUID)',
  })
  id: string;

  @ApiProperty({ example: 'Mathematics 10A', description: 'Name of the class' })
  name: string;

  @ApiProperty({
    example: 'Grade 10',
    description: 'Level or grade of the class',
  })
  level: string;

  @ApiPropertyOptional({
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    description: 'UUID of the homeroom teacher (User ID)',
    nullable: true,
  })
  homeroomTeacherId?: string | null;

  @ApiProperty({
    description: 'Date and time when the class record was created',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date and time when the class record was last updated',
  })
  updatedAt: Date;

  @ApiProperty({
    example: 'uuid-of-a-school',
    description: 'School ID the class belongs to.',
  })
  schoolId: string;

  constructor(partial: Partial<ClassBasicDto>) {
    Object.assign(this, partial);
  }
}
