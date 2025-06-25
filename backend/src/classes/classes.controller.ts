import {
  Controller, Get, Post, Body, Patch, Param, Delete, UsePipes,
  ValidationPipe, ParseUUIDPipe, HttpCode, HttpStatus, UseGuards, Req, // Import Req
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { ClassDto } from './dto/class.dto';
import { SubjectDto } from '../subjects/dto/subject.dto';
import { StudentDto } from '../students/dto/student.dto'; // Import StudentDto
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Classes Management')
@ApiBearerAuth()
@Controller('classes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SCHOOL_ADMIN) // Restrict class CRUD to SCHOOL_ADMIN
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

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
  @ApiOperation({ summary: 'Create a new class (Admin only for their school)' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Class created successfully.', type: ClassDto })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request - Invalid input data.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized - Token missing or invalid.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden - User does not have ADMIN role or school context missing.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Conflict - Class name already exists in this school.' })
  async create(@Body() createClassDto: CreateClassDto, @Req() req: any): Promise<ClassDto> {
    const schoolId = this.getSchoolIdFromRequest(req);
    return this.classesService.create(createClassDto, schoolId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all classes for the admin\'s school (Admin only)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of classes retrieved successfully.', type: [ClassDto] })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized - Token missing or invalid.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden - User does not have ADMIN role or school context missing.' })
  async findAll(@Req() req: any): Promise<ClassDto[]> {
    const schoolId = this.getSchoolIdFromRequest(req);
    return this.classesService.findAll(schoolId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a class by ID from the admin\'s school (Admin only)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Class ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Class details retrieved successfully.', type: ClassDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found - Class not found in this school.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request - Invalid UUID format.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized - Token missing or invalid.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden - User does not have ADMIN role or school context missing.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: any): Promise<ClassDto> {
    const schoolId = this.getSchoolIdFromRequest(req);
    return this.classesService.findOne(id, schoolId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a class by ID in the admin\'s school (Admin only)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Class ID' })
  @ApiBody({ type: UpdateClassDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Class updated successfully.', type: ClassDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found - Class not found.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request - Invalid input data or invalid UUID format.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized - Token missing or invalid.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden - User does not have ADMIN role.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Conflict - Class name already exists on another class.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateClassDto: UpdateClassDto,
    @Req() req: any,
  ): Promise<ClassDto> {
    const schoolId = this.getSchoolIdFromRequest(req);
    return this.classesService.update(id, updateClassDto, schoolId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a class by ID in the admin\'s school (Admin only)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Class ID' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Class deleted successfully.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found - Class not found in this school.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request - Invalid UUID format.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized - Token missing or invalid.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden - User does not have ADMIN role or school context missing.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: any): Promise<void> {
    const schoolId = this.getSchoolIdFromRequest(req);
    return this.classesService.remove(id, schoolId);
  }

  // Endpoints for managing subjects within a class
  @Post(':classId/subjects/:subjectId')
  @ApiOperation({ summary: 'Assign a subject to a class in the admin\'s school (Admin only)' })
  @ApiParam({ name: 'classId', type: 'string', format: 'uuid', description: 'ID of the class' })
  @ApiParam({ name: 'subjectId', type: 'string', format: 'uuid', description: 'ID of the subject to assign' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Subject assigned to class successfully.', type: ClassDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Class or Subject not found.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
  async assignSubjectToClass(
    @Param('classId', ParseUUIDPipe) classId: string,
    @Param('subjectId', ParseUUIDPipe) subjectId: string,
    @Req() req: any,
  ): Promise<SubjectDto> {
    const schoolId = this.getSchoolIdFromRequest(req);
    return this.classesService.assignSubject(classId, subjectId, schoolId);
  }

  @Delete(':classId/subjects/:subjectId')
  @ApiOperation({ summary: 'Remove a subject from a class in the admin\'s school (Admin only)' })
  @ApiParam({ name: 'classId', type: 'string', format: 'uuid', description: 'ID of the class' })
  @ApiParam({ name: 'subjectId', type: 'string', format: 'uuid', description: 'ID of the subject to remove' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Subject removed from class successfully.', type: ClassDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Class not found, or Subject not found in class in this school.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
  async removeSubjectFromClass(
    @Param('classId', ParseUUIDPipe) classId: string,
    @Param('subjectId', ParseUUIDPipe) subjectId: string,
    @Req() req: any,
  ): Promise<ClassDto> {
    const schoolId = this.getSchoolIdFromRequest(req);
    return this.classesService.removeSubjectFromClass(classId, subjectId, schoolId);
  }

  @Get(':classId/subjects')
  @ApiOperation({ summary: 'List all subjects for a class in the admin\'s school (Admin only)' })
  @ApiParam({ name: 'classId', type: 'string', format: 'uuid', description: 'ID of the class' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Subjects for the class retrieved successfully.', type: [SubjectDto] })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Class not found in this school.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
  async listSubjectsForClass(
    @Param('classId', ParseUUIDPipe) classId: string,
    @Req() req: any,
  ): Promise<SubjectDto[]> {
    const schoolId = this.getSchoolIdFromRequest(req);
    return this.classesService.listSubjectsForClass(classId, schoolId);
  }

  @Get(':classId/students')
  @ApiOperation({ summary: 'List all students enrolled in a specific class in the admin\'s school (Admin only)' })
  @ApiParam({ name: 'classId', type: 'string', format: 'uuid', description: 'Class ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of students in the class.', type: [StudentDto] })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Class not found in this school.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
  async listStudentsInClass(
    @Param('classId', ParseUUIDPipe) classId: string,
    @Req() req: any,
  ): Promise<StudentDto[]> {
    const schoolId = this.getSchoolIdFromRequest(req);
    return this.classesService.listStudentsInClass(classId, schoolId);
  }
}
