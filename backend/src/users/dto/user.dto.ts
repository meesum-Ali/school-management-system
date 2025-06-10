import { UserRole } from '../entities/user.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({
    example: '07a59e63-1f9c-4f7e-a78a-9f8aea3a0c75',
    description: 'Unique identifier of the user (UUID)',
  })
  id: string;

  @ApiProperty({ example: 'john.doe', description: 'Username of the user' })
  username: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address of the user',
  })
  email: string;

  @ApiPropertyOptional({
    example: 'John',
    description: 'First name of the user',
  })
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe', description: 'Last name of the user' })
  lastName?: string;

  @ApiProperty({
    example: true,
    description: 'Indicates if the user account is active',
  })
  isActive: boolean;

  @ApiProperty({
    enum: UserRole,
    isArray: true,
    example: [UserRole.STUDENT],
    description: 'Roles assigned to the user',
  })
  roles: UserRole[];

  @ApiProperty({ description: 'Date and time when the user was created' })
  createdAt: Date;

  @ApiProperty({ description: 'Date and time when the user was last updated' })
  updatedAt: Date;

  constructor(partial: Partial<UserDto>) {
    Object.assign(this, partial);
  }
}
