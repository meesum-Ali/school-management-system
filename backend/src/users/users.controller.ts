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
  Req, // Import Req to access the request object
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
// Default role for most operations might be ADMIN (school admin)
// SUPER_ADMIN will have explicit overrides or broader access via service logic
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Helper to extract contextualSchoolId - this will be replaced by actual JWT logic
  private getContextualSchoolId(req: any, userRoles: UserRole[]): string | null | undefined {
    // Placeholder: In a real scenario, 'req.user.schoolId' would come from JWT.
    // If the user is SUPER_ADMIN, they operate globally by default (contextualSchoolId = undefined)
    // unless they specify a schoolId in a DTO (for creation).
    // If user is ADMIN, their actions are scoped to their req.user.schoolId.
    if (userRoles.includes(UserRole.SUPER_ADMIN)) {
      return undefined; // Super admin can see all / act globally by default
    }
    return req.user?.schoolId || null; // School admin is scoped to their school
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN) // School Admin or Super Admin
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'User created successfully.', type: UserDto })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request - Invalid input data.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized - Token missing or invalid.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden - User does not have required role.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Conflict - Username or email already exists.' })
  async create(@Body() createUserDto: CreateUserDto, @Req() req: any): Promise<UserDto> {
    let schoolIdForCreation = createUserDto.schoolId; // SUPER_ADMIN can specify

    if (!req.user.roles.includes(UserRole.SUPER_ADMIN)) {
      // If not SUPER_ADMIN, user must be ADMIN, and schoolId is from their context
      schoolIdForCreation = req.user.schoolId;
      if (!schoolIdForCreation) {
         throw new ConflictException('School context is required for Admin to create users.');
      }
      // Admin cannot set schoolId via DTO, it's their own school
      if (createUserDto.schoolId && createUserDto.schoolId !== schoolIdForCreation) {
        throw new ConflictException('Admin users can only create users for their own school.');
      }
      createUserDto.schoolId = schoolIdForCreation; // Ensure DTO reflects admin's school
    }
    // If SUPER_ADMIN and createUserDto.schoolId is null/undefined, a global user is created.
    // If SUPER_ADMIN and createUserDto.schoolId is provided, user is created for that school.
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all users (respecting school context)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of users retrieved successfully.', type: [UserDto] })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized - Token missing or invalid.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden - User does not have required role.' })
  async findAll(@Req() req: any): Promise<UserDto[]> {
    const contextualSchoolId = this.getContextualSchoolId(req, req.user.roles);
    return this.usersService.findAll(contextualSchoolId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get a user by ID (respecting school context)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'User ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User details retrieved successfully.', type: UserDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found - User not found.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request - Invalid UUID format.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized - Token missing or invalid.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden - User does not have required role.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: any): Promise<UserDto> {
    const contextualSchoolId = this.getContextualSchoolId(req, req.user.roles);
    return this.usersService.findOne(id, contextualSchoolId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update a user by ID (respecting school context)' })
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
    @Req() req: any,
  ): Promise<UserDto> {
    const contextualSchoolId = this.getContextualSchoolId(req, req.user.roles);
    // Note: The `updateUserDto` should not contain `schoolId` to prevent changing a user's school association here.
    // The service method already prevents this, but good to be aware at controller level.
    return this.usersService.update(id, updateUserDto, contextualSchoolId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete a user by ID (respecting school context)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'User ID' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'User deleted successfully.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found - User not found.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request - Invalid UUID format.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized - Token missing or invalid.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden - User does not have required role.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: any): Promise<void> {
    const contextualSchoolId = this.getContextualSchoolId(req, req.user.roles);
    return this.usersService.remove(id, contextualSchoolId);
  }
}
