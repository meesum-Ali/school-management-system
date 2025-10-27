import { IsUUID, IsOptional, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignClassDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    description:
      'ID of the class to enroll the student in. Send null to unenroll.',
    nullable: true, // Important for Swagger
  })
  @IsOptional()
  @ValidateIf((object, value) => value !== null) // Apply IsUUID only if value is not null
  @IsUUID()
  classId: string | null;
}
