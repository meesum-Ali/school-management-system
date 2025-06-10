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
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';

@ApiTags('Users Management')
@ApiBearerAuth() // Indicates all routes in this controller require Bearer token
@Controller('users')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'User created successfully.', type: UserDto })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request - Invalid input data.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized - Token missing or invalid.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden - User does not have ADMIN role.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Conflict - Username or email already exists.' })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserDto> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of users retrieved successfully.', type: [UserDto] })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized - Token missing or invalid.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden - User does not have ADMIN role.' })
  async findAll(): Promise<UserDto[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID (Admin only)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'User ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User details retrieved successfully.', type: UserDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found - User not found.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request - Invalid UUID format.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized - Token missing or invalid.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden - User does not have ADMIN role.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<UserDto> {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user by ID (Admin only)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'User ID' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'User updated successfully.', type: UserDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found - User not found.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request - Invalid input data or invalid UUID format.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized - Token missing or invalid.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden - User does not have ADMIN role.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Conflict - Username or email already exists on another user.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserDto> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user by ID (Admin only)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'User ID' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'User deleted successfully.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found - User not found.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request - Invalid UUID format.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized - Token missing or invalid.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden - User does not have ADMIN role.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.usersService.remove(id);
  }
}
