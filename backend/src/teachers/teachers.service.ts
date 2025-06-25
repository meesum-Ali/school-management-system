import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Teacher } from './entities/teacher.entity';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
  ) {}

  async create(createTeacherDto: CreateTeacherDto): Promise<Teacher> {
    const teacher = this.teacherRepository.create(createTeacherDto);
    return this.teacherRepository.save(teacher);
  }

  async findAll(schoolId: string): Promise<Teacher[]> {
    return this.teacherRepository.find({
      where: { schoolId },
      relations: ['user', 'school', 'homeroomClasses'],
    });
  }

  async findOne(id: string, schoolId: string): Promise<Teacher> {
    const teacher = await this.teacherRepository.findOne({
      where: { id, schoolId },
      relations: ['user', 'school', 'homeroomClasses'],
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }

    return teacher;
  }

  async update(
    id: string,
    schoolId: string,
    updateTeacherDto: UpdateTeacherDto,
  ): Promise<Teacher> {
    const teacher = await this.findOne(id, schoolId);
    const updated = this.teacherRepository.merge(teacher, updateTeacherDto);
    return this.teacherRepository.save(updated);
  }

  async remove(id: string, schoolId: string): Promise<void> {
    const result = await this.teacherRepository.delete({ id, schoolId });
    if (result.affected === 0) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }
  }
}
