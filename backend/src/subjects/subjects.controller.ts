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
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { SubjectsService } from './subjects.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { SubjectDto } from './dto/subject.dto';
import { ClassDto } from '../classes/dto/class.dto'; // Import ClassDto
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Subjects Management')
@ApiBearerAuth()
@Controller('subjects')
@UseGuards(AuthGuard('zitadel'), RolesGuard)
@Roles(UserRole.SCHOOL_ADMIN) // Restrict subject CRUD to SCHOOL_ADMIN
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
)
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  // Helper to get schoolId from authenticated user (placeholder for actual JWT logic)
  private getSchoolIdFromRequest(req: any): string {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      throw new Error('School ID not found in user context for Admin user.');
    }
    return schoolId;
  }

  @Post()
  @ApiOperation({
    summary: "Create a new subject for the admin's school (Admin only)",
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Subject created successfully.',
    type: SubjectDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request - Invalid input data.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Token missing or invalid.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description:
      'Forbidden - User does not have ADMIN role or school context missing.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description:
      'Conflict - Subject name or code already exists in this school.',
  })
  async create(
    @Body() createSubjectDto: CreateSubjectDto,
    @Req() req: any,
  ): Promise<SubjectDto> {
    const schoolId = this.getSchoolIdFromRequest(req);
    return this.subjectsService.create(createSubjectDto, schoolId);
  }

  @Get()
  @ApiOperation({
    summary: "Get all subjects for the admin's school (Admin only)",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of subjects retrieved successfully.',
    type: [SubjectDto],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Token missing or invalid.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description:
      'Forbidden - User does not have ADMIN role or school context missing.',
  })
  async findAll(@Req() req: any): Promise<SubjectDto[]> {
    const schoolId = this.getSchoolIdFromRequest(req);
    return this.subjectsService.findAll(schoolId);
  }

  @Get(':id')
  @ApiOperation({
    summary: "Get a subject by ID from the admin's school (Admin only)",
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Subject ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subject details retrieved successfully.',
    type: SubjectDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Not Found - Subject not found in this school.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request - Invalid UUID format.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Token missing or invalid.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description:
      'Forbidden - User does not have ADMIN role or school context missing.',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: any,
  ): Promise<SubjectDto> {
    const schoolId = this.getSchoolIdFromRequest(req);
    return this.subjectsService.findOne(id, schoolId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: "Update a subject by ID in the admin's school (Admin only)",
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Subject ID',
  })
  @ApiBody({ type: UpdateSubjectDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subject updated successfully.',
    type: SubjectDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Not Found - Subject not found.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request - Invalid input data or invalid UUID format.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Token missing or invalid.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - User does not have ADMIN role.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description:
      'Conflict - Subject name or code already exists on another subject.',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSubjectDto: UpdateSubjectDto,
    @Req() req: any,
  ): Promise<SubjectDto> {
    const schoolId = this.getSchoolIdFromRequest(req);
    return this.subjectsService.update(id, updateSubjectDto, schoolId);
  }

  @Delete(':id')
  @ApiOperation({
    summary: "Delete a subject by ID in the admin's school (Admin only)",
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Subject ID',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Subject deleted successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Not Found - Subject not found in this school.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request - Invalid UUID format.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Token missing or invalid.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description:
      'Forbidden - User does not have ADMIN role or school context missing.',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: any,
  ): Promise<void> {
    const schoolId = this.getSchoolIdFromRequest(req);
    return this.subjectsService.remove(id, schoolId);
  }

  @Get(':subjectId/classes')
  @ApiOperation({
    summary:
      "List all classes for a subject in the admin's school (Admin only)",
  })
  @ApiParam({
    name: 'subjectId',
    type: 'string',
    format: 'uuid',
    description: 'ID of the subject',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Classes for the subject retrieved successfully.',
    type: [ClassDto],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Subject not found in this school.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
  async listClassesForSubject(
    @Param('subjectId', ParseUUIDPipe) subjectId: string,
    @Req() req: any,
  ): Promise<ClassDto[]> {
    const schoolId = this.getSchoolIdFromRequest(req);
    return this.subjectsService.listClassesForSubject(subjectId, schoolId);
  }
}
