import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards, // For future role-based access control
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
// import { RolesGuard } from '../auth/guards/roles.guard'; // Example for future
// import { Roles } from '../auth/decorators/roles.decorator'; // Example for future
// import { UserRole } from './entities/user.entity'; // Example for future

@Controller('users')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
// @UseGuards(RolesGuard) // Apply guard at controller level if all routes need role checks
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  // @Roles(UserRole.ADMIN) // Example: Only admins can create users
  async create(@Body() createUserDto: CreateUserDto): Promise<UserDto> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  // @Roles(UserRole.ADMIN) // Example: Only admins can view all users
  async findAll(): Promise<UserDto[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  // @Roles(UserRole.ADMIN) // Or allow users to get their own profile
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<UserDto> {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  // @Roles(UserRole.ADMIN) // Or allow users to update their own profile
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserDto> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  // @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT) // Or 200 with a success message
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.usersService.remove(id);
  }
}
