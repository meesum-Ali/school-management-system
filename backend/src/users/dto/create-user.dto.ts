import { IsString, IsEmail, IsNotEmpty, MinLength, IsOptional, IsArray, IsEnum, ArrayMinSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ example: 'john.doe', description: 'Unique username for the user' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'Unique email address for the user' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'P@$$wOrd123', description: 'Password for the user (min 8 characters)' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @ApiPropertyOptional({ example: 'John', description: 'First name of the user' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe', description: 'Last name of the user' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @IsArray()
  @IsEnum(UserRole, { each: true, message: "Each role must be a valid UserRole enum value (e.g., 'admin', 'teacher')" })
  @ArrayMinSize(1)
  @IsOptional()
  @ApiPropertyOptional({ enum: UserRole, isArray: true, example: [UserRole.TEACHER], description: 'Array of user roles' })
  roles?: UserRole[];

  @IsOptional()
  @ApiPropertyOptional({ example: true, description: 'Whether the user account is active' })
  isActive?: boolean; // Typically not set on creation by user, but admin might. Default is true in entity.

  @ApiPropertyOptional({ example: 'uuid-of-a-school', description: 'School ID to associate the user with. Only for SUPER_ADMIN.' })
  @IsString()
  @IsOptional()
  schoolId?: string;
}
