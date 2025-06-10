import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError, FindOptionsWhere } from 'typeorm';
import { SubjectEntity } from './entities/subject.entity';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { SubjectDto } from './dto/subject.dto';
import { ClassDto } from '../classes/dto/class.dto'; // Import ClassDto for mapping
import { ClassEntity } from '../classes/entities/class.entity'; // Required for type safety if using relations

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(SubjectEntity)
    private subjectsRepository: Repository<SubjectEntity>,
    // Note: No need to inject ClassRepository if only reading class data via relation
  ) {}

  private mapSubjectToSubjectDto(subjectEntity: SubjectEntity): SubjectDto {
    const subjectDto = new SubjectDto({
      id: subjectEntity.id,
      name: subjectEntity.name,
      code: subjectEntity.code,
      description: subjectEntity.description,
      createdAt: subjectEntity.createdAt,
      updatedAt: subjectEntity.updatedAt,
    });
    if (subjectEntity.classes) { // If classes are loaded, map them too
        subjectDto.classes = subjectEntity.classes.map(cls => new ClassDto({
            id: cls.id,
            name: cls.name,
            level: cls.level,
            homeroomTeacherId: cls.homeroomTeacherId,
            createdAt: cls.createdAt,
            updatedAt: cls.updatedAt,
            // Avoid mapping cls.subjects here to prevent circular dependencies
        }));
    }
    return subjectDto;
  }

  private mapClassToClassDto(classEntity: ClassEntity): ClassDto {
    // Basic mapper for ClassDto
    return new ClassDto({
        id: classEntity.id,
        name: classEntity.name,
        level: classEntity.level,
        homeroomTeacherId: classEntity.homeroomTeacherId,
        createdAt: classEntity.createdAt,
        updatedAt: classEntity.updatedAt,
    });
  }

  async create(createSubjectDto: CreateSubjectDto): Promise<SubjectDto> {
    const { name, code } = createSubjectDto;

    const conflictChecks: FindOptionsWhere<SubjectEntity>[] = [{ name }];
    if (code) {
      conflictChecks.push({ code });
    }
    const existingSubject = await this.subjectsRepository.findOne({ where: conflictChecks });

    if (existingSubject) {
      if (existingSubject.name === name) {
        throw new ConflictException(`Subject with name "${name}" already exists`);
      }
      if (code && existingSubject.code === code) {
        throw new ConflictException(`Subject with code "${code}" already exists`);
      }
    }

    try {
      const subjectEntity = this.subjectsRepository.create(createSubjectDto);
      const savedSubject = await this.subjectsRepository.save(subjectEntity);
      return this.mapSubjectToSubjectDto(savedSubject);
    } catch (error) {
      if (error instanceof QueryFailedError && (error as any).code === '23505') { // Unique constraint violation
        if (error.message.includes('subjects_name_key')) { // Adjust constraint name if different
             throw new ConflictException(`Subject with name "${name}" already exists.`);
        }
        if (code && error.message.includes('subjects_code_key')) { // Adjust constraint name if different
            throw new ConflictException(`Subject with code "${code}" already exists.`);
        }
      }
      throw new InternalServerErrorException('Error creating subject.');
    }
  }

  async findAll(): Promise<SubjectDto[]> {
    const subjects = await this.subjectsRepository.find();
    return subjects.map(subjectEntity => this.mapSubjectToSubjectDto(subjectEntity));
  }

  async findOne(id: string): Promise<SubjectDto> {
    const subjectEntity = await this.subjectsRepository.findOne({
        where: { id },
        relations: ['classes']
    });
    if (!subjectEntity) {
      throw new NotFoundException(`Subject with ID "${id}" not found`);
    }
    return this.mapSubjectToSubjectDto(subjectEntity);
  }

  async update(id: string, updateSubjectDto: UpdateSubjectDto): Promise<SubjectDto> {
    const { name, code, ...restOfDto } = updateSubjectDto;

    if (name) {
      const existingSubject = await this.subjectsRepository.findOne({ where: { name } });
      if (existingSubject && existingSubject.id !== id) {
        throw new ConflictException(`Subject with name "${name}" already exists.`);
      }
    }
    if (code) { // Also check code conflict if it's provided and not null
      const existingSubject = await this.subjectsRepository.findOne({ where: { code } });
      if (existingSubject && existingSubject.id !== id) {
        throw new ConflictException(`Subject with code "${code}" already exists.`);
      }
    }

    const subjectToUpdate = await this.subjectsRepository.preload({
      id: id,
      name, // Pass name explicitly
      code: updateSubjectDto.hasOwnProperty('code') ? code : undefined, // Pass code only if it's in DTO
      description: updateSubjectDto.hasOwnProperty('description') ? restOfDto.description : undefined,
      // ...restOfDto, // Don't spread restOfDto if it contains description already handled.
    });

    if(updateSubjectDto.hasOwnProperty('description')) {
        subjectToUpdate.description = restOfDto.description;
    }


    if (!subjectToUpdate) {
      throw new NotFoundException(`Subject with ID "${id}" not found`);
    }

    try {
      const updatedSubject = await this.subjectsRepository.save(subjectToUpdate);
      return this.mapSubjectToSubjectDto(updatedSubject);
    } catch (error) {
      if (error instanceof QueryFailedError && (error as any).code === '23505') {
        if (name && error.message.includes('subjects_name_key')) {
             throw new ConflictException(`Subject with name "${name}" already exists.`);
        }
        if (code && error.message.includes('subjects_code_key')) {
            throw new ConflictException(`Subject with code "${code}" already exists.`);
       }
      }
      throw new InternalServerErrorException('Error updating subject.');
    }
  }

  async remove(id: string): Promise<void> {
    const subjectEntity = await this.subjectsRepository.findOneBy({ id });
    if (!subjectEntity) {
      throw new NotFoundException(`Subject with ID "${id}" not found`);
    }
    const result = await this.subjectsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Subject with ID "${id}" not found or already deleted.`);
    }
  }

  async listClassesForSubject(subjectId: string): Promise<ClassDto[]> {
    const subjectEntity = await this.subjectsRepository.findOne({
        where: { id: subjectId },
        relations: ['classes']
    });
    if (!subjectEntity) {
      throw new NotFoundException(`Subject with ID "${subjectId}" not found`);
    }
    return subjectEntity.classes.map(cls => this.mapClassToClassDto(cls));
  }
}
