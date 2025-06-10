import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { ClassEntity } from './entities/class.entity';
import { SubjectEntity } from '../subjects/entities/subject.entity'; // Import SubjectEntity
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { ClassDto } from './dto/class.dto';
import { SubjectDto } from '../subjects/dto/subject.dto'; // Import SubjectDto for mapping

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(ClassEntity)
    private classesRepository: Repository<ClassEntity>,
    @InjectRepository(SubjectEntity) // Inject SubjectRepository
    private subjectsRepository: Repository<SubjectEntity>,
  ) {}

  private mapClassToClassDto(classEntity: ClassEntity): ClassDto {
    const classDto = new ClassDto({
      id: classEntity.id,
      name: classEntity.name,
      level: classEntity.level,
      homeroomTeacherId: classEntity.homeroomTeacherId,
      createdAt: classEntity.createdAt,
      updatedAt: classEntity.updatedAt,
    });
    if (classEntity.subjects) { // If subjects are loaded, map them too
      classDto.subjects = classEntity.subjects.map(subject => new SubjectDto({
        id: subject.id,
        name: subject.name,
        code: subject.code,
        description: subject.description,
        createdAt: subject.createdAt,
        updatedAt: subject.updatedAt,
        // Avoid mapping subject.classes here to prevent circular dependencies in this specific DTO mapping
      }));
    }
    return classDto;
  }

  private mapSubjectToSubjectDto(subjectEntity: SubjectEntity): SubjectDto {
    // Basic mapper for SubjectDto, can be expanded or moved to SubjectsService if more complex
    return new SubjectDto({
        id: subjectEntity.id,
        name: subjectEntity.name,
        code: subjectEntity.code,
        description: subjectEntity.description,
        createdAt: subjectEntity.createdAt,
        updatedAt: subjectEntity.updatedAt,
    });
  }


  async create(createClassDto: CreateClassDto): Promise<ClassDto> {
    const { name } = createClassDto;

    const existingClass = await this.classesRepository.findOne({ where: { name } });
    if (existingClass) {
      throw new ConflictException(`Class with name "${name}" already exists`);
    }

    try {
      const classEntity = this.classesRepository.create(createClassDto);
      const savedClass = await this.classesRepository.save(classEntity);
      return this.mapClassToClassDto(savedClass);
    } catch (error) {
      // Check for unique constraint violation if the initial check missed a race condition
      if (error instanceof QueryFailedError && (error as any).code === '23505') { // PostgreSQL unique violation
        if (error.message.includes('classes_name_key')) { // Adjust constraint name if different
             throw new ConflictException(`Class with name "${name}" already exists.`);
        }
      }
      throw new InternalServerErrorException('Error creating class.');
    }
  }

  async findAll(): Promise<ClassDto[]> {
    const classes = await this.classesRepository.find();
    return classes.map(classEntity => this.mapClassToClassDto(classEntity));
  }

  async findOne(id: string): Promise<ClassDto> {
    const classEntity = await this.classesRepository.findOne({
        where: { id },
        relations: ['subjects']
    });
    if (!classEntity) {
      throw new NotFoundException(`Class with ID "${id}" not found`);
    }
    return this.mapClassToClassDto(classEntity);
  }

  async update(id: string, updateClassDto: UpdateClassDto): Promise<ClassDto> {
    const { name, ...restOfDto } = updateClassDto;

    if (name) {
      const existingClass = await this.classesRepository.findOne({ where: { name } });
      if (existingClass && existingClass.id !== id) {
        throw new ConflictException(`Class with name "${name}" already exists.`);
      }
    }

    const classToUpdate = await this.classesRepository.preload({
      id: id,
      name, // Pass name explicitly to preload
      ...restOfDto,
    });

    if (!classToUpdate) {
      throw new NotFoundException(`Class with ID "${id}" not found`);
    }

    // Handle null for homeroomTeacherId explicitly if necessary
    // If homeroomTeacherId in updateClassDto is null, preload should handle it.
    // If it's undefined, it won't be changed by preload unless explicitly set to null.
    if (updateClassDto.hasOwnProperty('homeroomTeacherId')) {
        classToUpdate.homeroomTeacherId = updateClassDto.homeroomTeacherId;
    }


    try {
      const updatedClass = await this.classesRepository.save(classToUpdate);
      return this.mapClassToClassDto(updatedClass);
    } catch (error) {
      if (error instanceof QueryFailedError && (error as any).code === '23505') {
        if (error.message.includes('classes_name_key')) { // Adjust constraint name if different
             throw new ConflictException(`Class with name "${name}" already exists.`);
        }
      }
      throw new InternalServerErrorException('Error updating class.');
    }
  }

  async remove(id: string): Promise<void> {
    const classEntity = await this.classesRepository.findOneBy({ id });
    if (!classEntity) {
      throw new NotFoundException(`Class with ID "${id}" not found`);
    }
    const result = await this.classesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Class with ID "${id}" not found or already deleted.`);
    }
  }

  async assignSubjectToClass(classId: string, subjectId: string): Promise<ClassDto> {
    const classEntity = await this.classesRepository.findOne({ where: { id: classId }, relations: ['subjects'] });
    if (!classEntity) {
      throw new NotFoundException(`Class with ID "${classId}" not found`);
    }

    const subjectEntity = await this.subjectsRepository.findOneBy({ id: subjectId });
    if (!subjectEntity) {
      throw new NotFoundException(`Subject with ID "${subjectId}" not found`);
    }

    // Check if subject is already assigned
    const subjectAlreadyAssigned = classEntity.subjects.some(subject => subject.id === subjectId);
    if (subjectAlreadyAssigned) {
      // Optionally throw an error or just return the class as is
      // For idempotency, could just return the class. For stricter, throw Conflict.
      // For now, let's assume adding an existing one is not an error, TypeORM handles duplicates in relations.
    } else {
        classEntity.subjects.push(subjectEntity);
    }

    await this.classesRepository.save(classEntity);
    // Re-fetch to ensure relations are correctly loaded and returned after save,
    // as .save() on existing entity with new relations might not return them directly in all cases.
    return this.findOne(classId);
  }

  async removeSubjectFromClass(classId: string, subjectId: string): Promise<ClassDto> {
    const classEntity = await this.classesRepository.findOne({ where: { id: classId }, relations: ['subjects'] });
    if (!classEntity) {
      throw new NotFoundException(`Class with ID "${classId}" not found`);
    }

    const initialNumberOfSubjects = classEntity.subjects.length;
    classEntity.subjects = classEntity.subjects.filter(subject => subject.id !== subjectId);

    if (classEntity.subjects.length === initialNumberOfSubjects) {
        throw new NotFoundException(`Subject with ID "${subjectId}" not found in class "${classId}" or already removed.`);
    }

    await this.classesRepository.save(classEntity);
    return this.findOne(classId); // Return updated class with subjects
  }

  async listSubjectsForClass(classId: string): Promise<SubjectDto[]> {
    const classEntity = await this.classesRepository.findOne({ where: { id: classId }, relations: ['subjects'] });
    if (!classEntity) {
      throw new NotFoundException(`Class with ID "${classId}" not found`);
    }
    return classEntity.subjects.map(subject => this.mapSubjectToSubjectDto(subject));
  }
}
