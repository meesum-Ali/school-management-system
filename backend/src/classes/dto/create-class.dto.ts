import { IsString, IsNotEmpty, MinLength, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClassDto {
  @ApiProperty({ example: 'Mathematics 10A', description: 'Name of the class' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'Grade 10', description: 'Level or grade of the class' })
  @IsString()
  @IsNotEmpty()
  level: string;

  @ApiPropertyOptional({ example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', description: 'UUID of the homeroom teacher (User ID)' })
  @IsUUID('4')
  @IsOptional()
  homeroomTeacherId?: string;
}
