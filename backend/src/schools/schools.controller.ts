import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { SchoolsService } from './schools.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity'; // Assuming UserRole is defined here
import { School } from './entities/school.entity';

@Controller('schools')
@UseGuards(JwtAuthGuard, RolesGuard) // Protect all routes in this controller
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN) // Only Super Admin can create new schools
  async create(@Body() createSchoolDto: CreateSchoolDto): Promise<School> {
    return this.schoolsService.create(createSchoolDto);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN) // Only Super Admin can list all schools
  async findAll(): Promise<School[]> {
    return this.schoolsService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN) // Super Admin or School Admin (if part of this school - to be refined)
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<School | null> {
    // TODO: Add logic to ensure School Admin can only fetch their own school
    return this.schoolsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN) // Super Admin or School Admin (if part of this school)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSchoolDto: UpdateSchoolDto
  ): Promise<School> {
    // TODO: Add logic to ensure School Admin can only update their own school
    return this.schoolsService.update(id, updateSchoolDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN) // Only Super Admin can delete schools
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.schoolsService.remove(id);
  }
}
