import { IsString, IsEmail, IsNotEmpty, MinLength, IsOptional, IsArray, IsEnum, ArrayMinSize } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

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

  @IsOptional()
  isActive?: boolean; // Typically not set on creation by user, but admin might. Default is true in entity.
}
