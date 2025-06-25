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
  Req, // Import Req
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentDto } from './dto/student.dto';
import { AssignClassDto } from './dto/assign-class.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

// TODO: RBAC - Revisit read access (findAll, findOne) for Teachers/other roles once Class/Enrollment context is implemented.
@ApiTags('Students Management')
@ApiBearerAuth()
@Controller('students')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
@UseGuards(JwtAuthGuard, RolesGuard)
// Default role for student management is ADMIN (school admin)
// SUPER_ADMIN might access these if explicitly given the role or via a separate interface.
@Roles(UserRole.SCHOOL_ADMIN)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  // Helper to get schoolId from authenticated user (placeholder for actual JWT logic)
  private getSchoolIdFromRequest(req: any): string {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      // This should ideally not happen if JwtAuthGuard and RolesGuard ensure admin is school-scoped
      throw new Error('School ID not found in user context for Admin user.');
    }
    return schoolId;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new student (Admin only for their school)' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Student created successfully.', type: StudentDto })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request - Invalid input data.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized - Token missing or invalid.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden - User does not have ADMIN role or school context missing.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Conflict - Student ID or email already exists in this school.' })
  async create(@Body() createStudentDto: CreateStudentDto, @Req() req: any): Promise<StudentDto> {
    const schoolId = this.getSchoolIdFromRequest(req);
    return this.studentsService.create(createStudentDto, schoolId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all students for the admin\'s school (Admin only)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of students retrieved successfully.', type: [StudentDto] })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized - Token missing or invalid.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden - User does not have ADMIN role or school context missing.' })
  async findAll(@Req() req: any): Promise<StudentDto[]> {
    const schoolId = this.getSchoolIdFromRequest(req);
    return this.studentsService.findAll(schoolId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a student by ID from the admin\'s school (Admin only)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Student ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Student details retrieved successfully.', type: StudentDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found - Student not found in this school.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request - Invalid UUID format.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized - Token missing or invalid.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden - User does not have ADMIN role or school context missing.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: any): Promise<StudentDto> {
    const schoolId = this.getSchoolIdFromRequest(req);
    return this.studentsService.findOne(id, schoolId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a student by ID in the admin\'s school (Admin only)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Student ID' })
  @ApiBody({ type: UpdateStudentDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Student updated successfully.', type: StudentDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found - Student not found.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request - Invalid input data or invalid UUID format.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized - Token missing or invalid.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden - User does not have ADMIN role.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Conflict - Student ID or email already exists on another student.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStudentDto: UpdateStudentDto,
    @Req() req: any,
  ): Promise<StudentDto> {
    const schoolId = this.getSchoolIdFromRequest(req);
    return this.studentsService.update(id, updateStudentDto, schoolId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a student by ID in the admin\'s school (Admin only)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Student ID' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Student deleted successfully.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found - Student not found in this school.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request - Invalid UUID format.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized - Token missing or invalid.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden - User does not have ADMIN role or school context missing.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: any): Promise<void> {
    const schoolId = this.getSchoolIdFromRequest(req);
    return this.studentsService.remove(id, schoolId);
  }

  @Patch(':studentId/assign-class')
  @ApiOperation({ summary: 'Assign or Unassign a student to/from a class in the admin\'s school (Admin only)' })
  @ApiParam({ name: 'studentId', type: 'string', format: 'uuid', description: 'Student ID' })
  @ApiBody({ type: AssignClassDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Student class assignment updated successfully.', type: StudentDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Student or Class not found in this school.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request - Invalid input data.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
  async assignClass(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Body() assignClassDto: AssignClassDto,
    @Req() req: any,
  ): Promise<StudentDto> {
    const schoolId = this.getSchoolIdFromRequest(req);
    return this.studentsService.assignStudentToClass(studentId, assignClassDto.classId, schoolId);
  }
}
