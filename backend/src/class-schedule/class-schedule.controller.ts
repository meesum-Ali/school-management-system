import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseUUIDPipe,
  Query,
  HttpStatus,
  HttpCode,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { ClassScheduleService } from './class-schedule.service';
import { CreateClassScheduleDto } from './dto/create-class-schedule.dto';
import { UpdateClassScheduleDto } from './dto/update-class-schedule.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ClassSchedule } from './entities/class-schedule.entity';

@ApiTags('Class Schedule')
@ApiBearerAuth()
@Controller('class-schedule')
@UseGuards(AuthGuard('zitadel'), RolesGuard)
@Roles(UserRole.SCHOOL_ADMIN, UserRole.TEACHER) // Removed duplicate SCHOOL_ADMIN
export class ClassScheduleController {
  constructor(private readonly classScheduleService: ClassScheduleService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new class schedule' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The class schedule has been successfully created.',
    type: ClassSchedule,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Scheduling conflict detected',
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
  async create(
    @Body() createClassScheduleDto: CreateClassScheduleDto,
    @Request() req,
  ): Promise<ClassSchedule> {
    // If user is a teacher, they can only create schedules assigning themselves
    if (req.user.role === UserRole.TEACHER) {
      if (
        createClassScheduleDto.teacherId &&
        createClassScheduleDto.teacherId !== req.user.id
      ) {
        throw new ForbiddenException(
          'You can only assign yourself as a teacher',
        );
      }
      createClassScheduleDto.teacherId = req.user.id;
    }

    return this.classScheduleService.create({
      ...createClassScheduleDto,
      schoolId: req.user.schoolId,
      userId:
        req.user.role === UserRole.TEACHER
          ? req.user.id
          : createClassScheduleDto.userId,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all class schedules for the current school' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return all class schedules.',
    type: [ClassSchedule],
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
  async findAll(@Request() req): Promise<ClassSchedule[]> {
    return this.classScheduleService.findAll(req.user.schoolId);
  }

  @Get('class/:classId')
  @ApiOperation({ summary: 'Get class schedules by class ID' })
  @ApiParam({ name: 'classId', description: 'ID of the class' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return class schedules for the specified class.',
    type: [ClassSchedule],
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Class not found' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
  async findByClass(
    @Param('classId', ParseUUIDPipe) classId: string,
    @Request() req,
  ): Promise<ClassSchedule[]> {
    return this.classScheduleService.findByClass(classId, req.user.schoolId);
  }

  @Get('teacher/:teacherId')
  @ApiOperation({ summary: 'Get schedules for a specific teacher' })
  @ApiParam({ name: 'teacherId', description: 'ID of the teacher' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return schedules for the specified teacher.',
    type: [ClassSchedule],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Teacher not found',
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
  async findByTeacher(
    @Param('teacherId', ParseUUIDPipe) teacherId: string,
    @Request() req,
  ): Promise<ClassSchedule[]> {
    // Only allow teachers to view their own schedule unless they're admins
    if (
      req.user.role === UserRole.TEACHER &&
      req.user.teacherId !== teacherId
    ) {
      teacherId = req.user.teacherId;
    }

    return this.classScheduleService.findByTeacher(
      teacherId,
      req.user.schoolId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific class schedule by ID' })
  @ApiParam({ name: 'id', description: 'ID of the class schedule' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return the requested class schedule.',
    type: ClassSchedule,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Class schedule not found',
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ): Promise<ClassSchedule> {
    return this.classScheduleService.findOne(id, req.user.schoolId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a class schedule' })
  @ApiParam({ name: 'id', description: 'ID of the class schedule to update' })
  @ApiBody({ type: UpdateClassScheduleDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The class schedule has been updated.',
    type: ClassSchedule,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Class schedule not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Scheduling conflict detected',
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateClassScheduleDto: UpdateClassScheduleDto,
    @Request() req,
  ): Promise<ClassSchedule> {
    // If user is a teacher, they can only update their own schedules
    if (req.user.role === UserRole.TEACHER) {
      const schedule = await this.classScheduleService.findOne(
        id,
        req.user.schoolId,
      );
      if (schedule.teacherId !== req.user.teacherId) {
        throw new ForbiddenException('You can only update your own schedules');
      }
    }

    return this.classScheduleService.update(
      id,
      req.user.schoolId,
      updateClassScheduleDto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a class schedule' })
  @ApiParam({ name: 'id', description: 'ID of the class schedule to delete' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The class schedule has been deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Class schedule not found',
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ): Promise<void> {
    // If user is a teacher, they can only delete their own schedules
    if (req.user.role === UserRole.TEACHER) {
      const schedule = await this.classScheduleService.findOne(
        id,
        req.user.schoolId,
      );
      if (schedule.teacherId !== req.user.teacherId) {
        throw new ForbiddenException('You can only delete your own schedules');
      }
    }

    await this.classScheduleService.remove(id, req.user.schoolId);
  }
}
