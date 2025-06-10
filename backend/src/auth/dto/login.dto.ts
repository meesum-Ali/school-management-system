import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'john.doe', description: 'Username of the user' })
  @IsString()
  @IsNotEmpty({ message: 'Username should not be empty' })
  username: string;

  @ApiProperty({ example: 'P@$$wOrd123', description: 'Password of the user (min 8 characters)' })
  @IsString()
  @IsNotEmpty({ message: 'Password should not be empty' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;
}
