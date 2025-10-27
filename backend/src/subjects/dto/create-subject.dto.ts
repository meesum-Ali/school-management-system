import { IsString, IsNotEmpty, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSubjectDto {
  @ApiProperty({
    example: 'Introduction to Algebra',
    description: 'Name of the subject',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @ApiPropertyOptional({
    example: 'MATH101',
    description: 'Unique code for the subject',
  })
  @IsString()
  @IsOptional()
  @MinLength(3)
  code?: string;

  @ApiPropertyOptional({
    example: 'Basic concepts of algebra for beginners.',
    description: 'Optional description of the subject',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
