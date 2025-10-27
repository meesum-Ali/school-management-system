import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

// DDD: Application Layer (Use Cases)
import {
  CreateStudentUseCase,
  EnrollStudentUseCase,
  UnenrollStudentUseCase,
  UpdateStudentUseCase,
  GetStudentByIdUseCase,
  ListStudentsUseCase,
} from './application/use-cases';

// DDD: Application Layer (DTOs)
import {
  CreateStudentDto,
  UpdateStudentDto,
  EnrollStudentDto,
  StudentResponseDto,
} from './application/dtos';

// Legacy DTOs for backward compatibility
import { StudentDto } from './dto/student.dto';
import { AssignClassDto } from './dto/assign-class.dto';

/**
 * Students Controller (DDD Architecture)
 *
 * This controller uses the new DDD layered architecture with use cases.
 * It maintains the same API contract as the legacy controller for backward compatibility.
 *
 * Route: /api/v2/students (new versioned endpoint)
 */
@ApiTags('Students Management (DDD v2)')
@ApiBearerAuth()
@Controller('v2/students')
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
)
@UseGuards(AuthGuard('zitadel'), RolesGuard)
@Roles(UserRole.SCHOOL_ADMIN)
export class StudentsV2Controller {
  constructor(
    private readonly createStudentUseCase: CreateStudentUseCase,
    private readonly enrollStudentUseCase: EnrollStudentUseCase,
    private readonly unenrollStudentUseCase: UnenrollStudentUseCase,
    private readonly updateStudentUseCase: UpdateStudentUseCase,
    private readonly getStudentByIdUseCase: GetStudentByIdUseCase,
    private readonly listStudentsUseCase: ListStudentsUseCase,
  ) {}

  private getSchoolIdFromRequest(req: any): string {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      throw new Error('School ID not found in user context for Admin user.');
    }
    return schoolId;
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new student (DDD architecture)',
    description:
      'Uses CreateStudentUseCase to create a new student with domain validation',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Student created successfully.',
    type: StudentDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request - Invalid input data or business rule violation.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Conflict - Email already exists in this school.',
  })
  async create(
    @Body() createDto: CreateStudentDto,
    @Req() req: any,
  ): Promise<StudentResponseDto> {
    const schoolId = this.getSchoolIdFromRequest(req);

    // Execute use case
    const result = await this.createStudentUseCase.execute({
      ...createDto,
      schoolId,
    });

    return result;
  }

  @Get()
  @ApiOperation({
    summary: "Get all students for the admin's school",
    description:
      'Uses ListStudentsUseCase to retrieve paginated list of students',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (1-based)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of students retrieved successfully.',
    type: [StudentDto],
  })
  async findAll(
    @Req() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<StudentResponseDto[]> {
    const schoolId = this.getSchoolIdFromRequest(req);

    // Execute use case
    const students = await this.listStudentsUseCase.execute(
      schoolId,
      page,
      limit,
    );

    return students;
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a student by ID',
    description: 'Uses GetStudentByIdUseCase to retrieve student details',
  })
  @ApiParam({ name: 'id', type: 'string', description: 'Student ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Student details retrieved successfully.',
    type: StudentDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Not Found - Student not found in this school.',
  })
  async findOne(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<StudentResponseDto> {
    const schoolId = this.getSchoolIdFromRequest(req);

    // Execute use case
    const student = await this.getStudentByIdUseCase.execute(id, schoolId);

    return student;
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a student by ID',
    description: 'Uses UpdateStudentUseCase to update student profile',
  })
  @ApiParam({ name: 'id', type: 'string', description: 'Student ID' })
  @ApiBody({ type: UpdateStudentDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Student updated successfully.',
    type: StudentDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Not Found - Student not found.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Conflict - Email already exists on another student.',
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateStudentDto,
    @Req() req: any,
  ): Promise<StudentResponseDto> {
    const schoolId = this.getSchoolIdFromRequest(req);

    // Execute use case
    const result = await this.updateStudentUseCase.execute(
      id,
      schoolId,
      updateDto,
    );

    return result;
  }

  @Patch(':studentId/enroll')
  @ApiOperation({
    summary: 'Enroll a student in a class',
    description:
      'Uses EnrollStudentUseCase to enroll student with domain validation',
  })
  @ApiParam({ name: 'studentId', type: 'string', description: 'Student ID' })
  @ApiBody({ type: AssignClassDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Student enrolled successfully.',
    type: StudentDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Student not found.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Student already enrolled in a class.',
  })
  async enrollStudent(
    @Param('studentId') studentId: string,
    @Body() enrollDto: AssignClassDto,
    @Req() req: any,
  ): Promise<StudentResponseDto> {
    const schoolId = this.getSchoolIdFromRequest(req);

    // Execute use case
    const result = await this.enrollStudentUseCase.execute({
      studentId,
      classId: enrollDto.classId,
      schoolId,
    });

    return result;
  }

  @Patch(':studentId/unenroll')
  @ApiOperation({
    summary: 'Unenroll a student from their class',
    description: 'Uses UnenrollStudentUseCase to remove student from class',
  })
  @ApiParam({ name: 'studentId', type: 'string', description: 'Student ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Student unenrolled successfully.',
    type: StudentDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Student not found.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Student is not enrolled in any class.',
  })
  async unenrollStudent(
    @Param('studentId') studentId: string,
    @Req() req: any,
  ): Promise<StudentResponseDto> {
    const schoolId = this.getSchoolIdFromRequest(req);

    // Execute use case
    const result = await this.unenrollStudentUseCase.execute({
      studentId,
      schoolId,
    });

    return result;
  }
}
