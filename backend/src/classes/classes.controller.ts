import {
  Controller, Get, Post, Body, Patch, Param, Delete, UsePipes,
  ValidationPipe, ParseUUIDPipe, HttpCode, HttpStatus, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { ClassDto } from './dto/class.dto';
import { SubjectDto } from '../subjects/dto/subject.dto';
import { StudentDto } from '../../students/dto/student.dto'; // Import StudentDto
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Classes Management')
@ApiBearerAuth()
@Controller('classes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN) // Initially restrict all class CRUD to ADMIN
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new class (Admin only)' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Class created successfully.', type: ClassDto })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request - Invalid input data.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized - Token missing or invalid.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden - User does not have ADMIN role.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Conflict - Class name already exists.' })
  async create(@Body() createClassDto: CreateClassDto): Promise<ClassDto> {
    return this.classesService.create(createClassDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all classes (Admin only)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of classes retrieved successfully.', type: [ClassDto] })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized - Token missing or invalid.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden - User does not have ADMIN role.' })
  async findAll(): Promise<ClassDto[]> {
    return this.classesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a class by ID (Admin only)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Class ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Class details retrieved successfully.', type: ClassDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found - Class not found.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request - Invalid UUID format.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized - Token missing or invalid.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden - User does not have ADMIN role.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ClassDto> {
    return this.classesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a class by ID (Admin only)' })
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
  ): Promise<ClassDto> {
    return this.classesService.update(id, updateClassDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a class by ID (Admin only)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Class ID' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Class deleted successfully.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found - Class not found.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request - Invalid UUID format.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized - Token missing or invalid.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden - User does not have ADMIN role.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.classesService.remove(id);
  }

  // Endpoints for managing subjects within a class
  @Post(':classId/subjects/:subjectId')
  @ApiOperation({ summary: 'Assign a subject to a class (Admin only)' })
  @ApiParam({ name: 'classId', type: 'string', format: 'uuid', description: 'ID of the class' })
  @ApiParam({ name: 'subjectId', type: 'string', format: 'uuid', description: 'ID of the subject to assign' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Subject assigned to class successfully.', type: ClassDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Class or Subject not found.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
  async assignSubjectToClass(
    @Param('classId', ParseUUIDPipe) classId: string,
    @Param('subjectId', ParseUUIDPipe) subjectId: string,
  ): Promise<ClassDto> {
    return this.classesService.assignSubjectToClass(classId, subjectId);
  }

  @Delete(':classId/subjects/:subjectId')
  @ApiOperation({ summary: 'Remove a subject from a class (Admin only)' })
  @ApiParam({ name: 'classId', type: 'string', format: 'uuid', description: 'ID of the class' })
  @ApiParam({ name: 'subjectId', type: 'string', format: 'uuid', description: 'ID of the subject to remove' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Subject removed from class successfully.', type: ClassDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Class not found, or Subject not found in class.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
  async removeSubjectFromClass(
    @Param('classId', ParseUUIDPipe) classId: string,
    @Param('subjectId', ParseUUIDPipe) subjectId: string,
  ): Promise<ClassDto> {
    return this.classesService.removeSubjectFromClass(classId, subjectId);
  }

  @Get(':classId/subjects')
  @ApiOperation({ summary: 'List all subjects for a class (Admin only)' })
  @ApiParam({ name: 'classId', type: 'string', format: 'uuid', description: 'ID of the class' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Subjects for the class retrieved successfully.', type: [SubjectDto] })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Class not found.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
  async listSubjectsForClass(
    @Param('classId', ParseUUIDPipe) classId: string,
  ): Promise<SubjectDto[]> {
    return this.classesService.listSubjectsForClass(classId);
  }

  @Get(':classId/students')
  @ApiOperation({ summary: 'List all students enrolled in a specific class (Admin only)' })
  @ApiParam({ name: 'classId', type: 'string', format: 'uuid', description: 'Class ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of students in the class.', type: [StudentDto] })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Class not found.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
  // @Roles(UserRole.ADMIN) // Inherited from class decorator
  async listStudentsInClass(
    @Param('classId', ParseUUIDPipe) classId: string,
  ): Promise<StudentDto[]> {
    return this.classesService.listStudentsInClass(classId);
  }
}
