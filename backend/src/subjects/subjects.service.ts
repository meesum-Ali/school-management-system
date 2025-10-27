import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError, FindOptionsWhere } from 'typeorm';
import { SubjectEntity } from './entities/subject.entity';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { SubjectDto } from './dto/subject.dto';
import { ClassBasicDto } from '../classes/dto/class-basic.dto';
import { ClassEntity } from '../classes/entities/class.entity'; // Required for type safety if using relations

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(SubjectEntity)
    private subjectsRepository: Repository<SubjectEntity>,
    // Note: No need to inject ClassRepository if only reading class data via relation
  ) {}

  private async mapSubjectToSubjectDto(
    subjectEntity: SubjectEntity,
  ): Promise<SubjectDto> {
    const subjectDto = new SubjectDto({
      id: subjectEntity.id,
      name: subjectEntity.name,
      code: subjectEntity.code,
      description: subjectEntity.description,
      createdAt: subjectEntity.createdAt,
      updatedAt: subjectEntity.updatedAt,
      schoolId: subjectEntity.schoolId,
    });

    if (subjectEntity.classes) {
      const classes = await subjectEntity.classes;
      subjectDto.classes = classes.map((cls) => ({
        id: cls.id,
        name: cls.name,
        level: cls.level,
        homeroomTeacherId: cls.homeroomTeacherId,
        createdAt: cls.createdAt,
        updatedAt: cls.updatedAt,
        schoolId: cls.schoolId,
      }));
    }
    return subjectDto;
  }

  private mapClassToBasicDto(classEntity: ClassEntity): ClassBasicDto {
    return {
      id: classEntity.id,
      name: classEntity.name,
      level: classEntity.level,
      homeroomTeacherId: classEntity.homeroomTeacherId,
      schoolId: classEntity.schoolId,
      createdAt: classEntity.createdAt,
      updatedAt: classEntity.updatedAt,
    };
  }

  async create(
    createSubjectDto: CreateSubjectDto,
    schoolId: string,
  ): Promise<SubjectDto> {
    const { name, code } = createSubjectDto;

    // Check for conflicts within the same school
    const nameConflict = await this.subjectsRepository.findOne({
      where: { name, schoolId },
    });
    if (nameConflict) {
      throw new ConflictException(
        `Subject with name "${name}" already exists in this school.`,
      );
    }
    if (code) {
      const codeConflict = await this.subjectsRepository.findOne({
        where: { code, schoolId },
      });
      if (codeConflict) {
        throw new ConflictException(
          `Subject with code "${code}" already exists in this school.`,
        );
      }
    }

    try {
      const subjectToCreate = this.subjectsRepository.create({
        ...createSubjectDto,
        schoolId, // Set the schoolId from context
      });
      const savedSubject = await this.subjectsRepository.save(subjectToCreate);
      return this.mapSubjectToSubjectDto(savedSubject);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as any).code === '23505'
      ) {
        // Adjust unique constraint name based on your actual @Index definition
        if (
          error.message.includes('subjects_name_school_id_idx') ||
          error.message.includes('UQ_subjects_name_schoolId')
        ) {
          throw new ConflictException(
            `Subject with name "${name}" already exists in this school.`,
          );
        }
        if (
          code &&
          (error.message.includes('subjects_code_school_id_idx') ||
            error.message.includes('UQ_subjects_code_schoolId'))
        ) {
          throw new ConflictException(
            `Subject with code "${code}" already exists in this school.`,
          );
        }
      }
      throw new InternalServerErrorException('Error creating subject.');
    }
  }

  async findAll(schoolId: string): Promise<SubjectDto[]> {
    const subjects = await this.subjectsRepository.find({
      where: { schoolId },
      // relations: ['classes'] // Optional: load classes if needed for list view DTOs
    });
    return Promise.all(
      subjects.map((subjectEntity) =>
        this.mapSubjectToSubjectDto(subjectEntity),
      ),
    );
  }

  async findOne(id: string, schoolId: string): Promise<SubjectDto> {
    const subjectEntity = await this.subjectsRepository.findOne({
      where: { id, schoolId }, // Filter by schoolId
      relations: ['classes'],
    });
    if (!subjectEntity) {
      throw new NotFoundException(
        `Subject with ID "${id}" not found in this school.`,
      );
    }
    return await this.mapSubjectToSubjectDto(subjectEntity);
  }

  async update(
    id: string,
    updateSubjectDto: UpdateSubjectDto,
    schoolId: string,
  ): Promise<SubjectDto> {
    const { name, code, description } = updateSubjectDto;

    // Ensure the subject exists within the given school
    const subjectToUpdate = await this.subjectsRepository.findOneBy({
      id,
      schoolId,
    });
    if (!subjectToUpdate) {
      throw new NotFoundException(
        `Subject with ID "${id}" not found in this school.`,
      );
    }

    // Check for conflicts within the same school if name or code is being changed
    if (name && name !== subjectToUpdate.name) {
      const nameConflict = await this.subjectsRepository.findOne({
        where: { name, schoolId },
      });
      if (nameConflict && nameConflict.id !== id) {
        throw new ConflictException(
          `Subject with name "${name}" already exists in this school.`,
        );
      }
      subjectToUpdate.name = name;
    }

    if (updateSubjectDto.hasOwnProperty('code')) {
      // Allow setting code to null
      if (code && code !== subjectToUpdate.code) {
        const codeConflict = await this.subjectsRepository.findOne({
          where: { code, schoolId },
        });
        if (codeConflict && codeConflict.id !== id) {
          throw new ConflictException(
            `Subject with code "${code}" already exists in this school.`,
          );
        }
      }
      subjectToUpdate.code = code; // This handles null as well
    }

    if (updateSubjectDto.hasOwnProperty('description')) {
      subjectToUpdate.description = description; // This handles null as well
    }

    // No need to spread restOfDto as all properties are explicitly handled or not updatable (like schoolId)

    try {
      const updatedSubject =
        await this.subjectsRepository.save(subjectToUpdate);
      // Re-fetch with relations for consistent DTO response
      return await this.findOne(updatedSubject.id, schoolId);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as any).code === '23505'
      ) {
        if (
          name &&
          (error.message.includes('subjects_name_school_id_idx') ||
            error.message.includes('UQ_subjects_name_schoolId'))
        ) {
          throw new ConflictException(
            `Subject with name "${name}" already exists in this school.`,
          );
        }
        if (
          code &&
          (error.message.includes('subjects_code_school_id_idx') ||
            error.message.includes('UQ_subjects_code_schoolId'))
        ) {
          throw new ConflictException(
            `Subject with code "${code}" already exists in this school.`,
          );
        }
      }
      throw new InternalServerErrorException('Error updating subject.');
    }
  }

  async remove(id: string, schoolId: string): Promise<void> {
    // Ensure the subject exists within the given school before deleting
    const subjectEntity = await this.subjectsRepository.findOneBy({
      id,
      schoolId,
    });
    if (!subjectEntity) {
      throw new NotFoundException(
        `Subject with ID "${id}" not found in this school.`,
      );
    }
    const result = await this.subjectsRepository.delete({ id, schoolId }); // Scope delete by schoolId
    if (result.affected === 0) {
      throw new NotFoundException(
        `Subject with ID "${id}" in this school not found or already deleted.`,
      );
    }
  }

  async listClassesForSubject(
    subjectId: string,
    schoolId: string,
  ): Promise<ClassBasicDto[]> {
    // First validate the subject exists and belongs to the school
    const subjectEntity = await this.subjectsRepository.findOne({
      where: { id: subjectId, schoolId }, // Ensure subject belongs to the school
      relations: ['classes', 'classes.school'], // Load classes and their school info for DTO mapping
    });
    if (!subjectEntity) {
      throw new NotFoundException(
        `Subject with ID "${subjectId}" not found in this school.`,
      );
    }
    // Ensure that the classes being mapped also have their schoolId properly set for mapClassToBasicDto
    const classes = await subjectEntity.classes;
    return classes.map((cls) => this.mapClassToBasicDto(cls));
  }
}
