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
  Logger,
} from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('teachers')
@UseGuards(AuthGuard('zitadel'), RolesGuard)
@Roles(UserRole.SCHOOL_ADMIN) // Removed ADMIN as it's no longer a valid role
export class TeachersController {
  private readonly logger = new Logger(TeachersController.name);
  
  constructor(private readonly teachersService: TeachersService) {}

  @Post()
  create(@Body() createTeacherDto: CreateTeacherDto, @Request() req) {
    this.logger.log(`POST /teachers - User: ${req.user?.userId}`);
    return this.teachersService.create({
      ...createTeacherDto,
      schoolId: req.user.schoolId,
    });
  }

  @Get()
  findAll(@Request() req) {
    this.logger.log(`GET /teachers - User: ${req.user?.userId}, SchoolId: ${req.user?.schoolId}`);
    return this.teachersService.findAll(req.user.schoolId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.teachersService.findOne(id, req.user.schoolId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTeacherDto: UpdateTeacherDto,
    @Request() req,
  ) {
    return this.teachersService.update(id, req.user.schoolId, updateTeacherDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.teachersService.remove(id, req.user.schoolId);
  }
}
