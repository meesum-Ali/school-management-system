import {
  IsString,
  IsEmail,
  IsOptional,
  IsArray,
  IsEnum,
  ArrayMinSize,
  MinLength,
  IsBoolean,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'john.doe.new',
    description: 'New unique username for the user',
  })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiPropertyOptional({
    example: 'john.new@example.com',
    description: 'New unique email address for the user',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    example: 'NewP@$$wOrd123',
    description: 'New password for the user (min 8 characters)',
  })
  @IsString()
  @IsOptional()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password?: string;

  @ApiPropertyOptional({
    example: 'Johnathan',
    description: 'New first name of the user',
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({
    example: 'Doer',
    description: 'New last name of the user',
  })
  @IsString()
  @IsOptional()
  lastName?: string;

  @IsArray()
  @IsEnum(UserRole, {
    each: true,
    message:
      "Each role must be a valid UserRole enum value (e.g., 'admin', 'teacher')",
  })
  @ArrayMinSize(1)
  @IsOptional()
  @ApiPropertyOptional({
    enum: UserRole,
    isArray: true,
    example: [UserRole.SCHOOL_ADMIN],
    description: 'Array of user roles',
  })
  roles?: UserRole[];

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({
    example: true,
    description: 'Whether the user account is active',
  })
  isActive?: boolean;
}
