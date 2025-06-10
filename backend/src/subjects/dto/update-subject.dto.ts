import { IsString, IsNotEmpty, MinLength, IsOptional, Allow } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSubjectDto {
  @ApiPropertyOptional({ example: 'Advanced Algebra', description: 'Updated name of the subject' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'ALG201', description: 'Updated unique code for the subject (or null to remove)' })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @Allow() // Allow null to clear the code
  code?: string | null;

  @ApiPropertyOptional({ example: 'In-depth exploration of algebraic concepts.', description: 'Updated description of the subject (or null to remove)' })
  @IsString()
  @IsOptional()
  @Allow() // Allow null to clear the description
  description?: string | null;
}
