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
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentDto } from './dto/student.dto';

@Controller('students')
// Apply ValidationPipe globally or ensure it's set up in main.ts
// For consistency with UsersController, explicit UsePipes is fine here.
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  // TODO: Add RoleGuard(UserRole.ADMIN) or similar for access control
  async create(@Body() createStudentDto: CreateStudentDto): Promise<StudentDto> {
    return this.studentsService.create(createStudentDto);
  }

  @Get()
  // TODO: Add RoleGuard for appropriate roles
  async findAll(): Promise<StudentDto[]> {
    return this.studentsService.findAll();
  }

  @Get(':id')
  // TODO: Add RoleGuard
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<StudentDto> {
    return this.studentsService.findOne(id);
  }

  @Patch(':id')
  // TODO: Add RoleGuard
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStudentDto: UpdateStudentDto,
  ): Promise<StudentDto> {
    return this.studentsService.update(id, updateStudentDto);
  }

  @Delete(':id')
  // TODO: Add RoleGuard
  @HttpCode(HttpStatus.NO_CONTENT) // Standard for successful DELETE with no body response
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.studentsService.remove(id);
  }
}
