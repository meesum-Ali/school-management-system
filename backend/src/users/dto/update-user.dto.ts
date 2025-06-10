import { IsString, IsEmail, IsOptional, IsArray, IsEnum, ArrayMinSize, MinLength, IsBoolean } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  username?: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsOptional()
  email?: string;

  // Password updates should ideally be handled via a separate dedicated DTO and endpoint
  // for security reasons (e.g., requiring current password).
  // If included here, make it optional and ensure hashing logic is correctly applied in the service.
  @IsString()
  @IsOptional()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsArray()
  @IsEnum(UserRole, { each: true })
  @ArrayMinSize(1)
  @IsOptional()
  roles?: UserRole[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
