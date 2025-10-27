import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsUUID,
  IsOptional,
  Allow,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateClassDto {
  @ApiPropertyOptional({
    example: 'Mathematics 10A - Advanced',
    description: 'Updated name of the class',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: 'Grade 10 - Section A',
    description: 'Updated level or grade of the class',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  level?: string;

  @ApiPropertyOptional({
    example: 'b2c3d4e5-f6g7-8901-2345-67890abcdef1',
    description:
      'Updated UUID of the homeroom teacher (User ID), or null to remove',
  })
  @IsUUID('4')
  @IsOptional()
  @Allow() // Allows the value to be null, so it can be explicitly cleared
  homeroomTeacherId?: string | null;
}
