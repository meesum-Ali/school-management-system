import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { ClassEntity } from './entities/class.entity';
import { SubjectEntity } from '../subjects/entities/subject.entity';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { ClassDto } from './dto/class.dto';
import { SubjectDto } from '../subjects/dto/subject.dto';
import { StudentDto } from '../students/dto/student.dto';
import { Student } from '../students/entities/student.entity';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(ClassEntity)
    private classesRepository: Repository<ClassEntity>,
    @InjectRepository(SubjectEntity)
    private subjectsRepository: Repository<SubjectEntity>,
    private usersService: UsersService,
  ) {}

  private mapClassToClassDto(classEntity: ClassEntity): ClassDto {
    const mapStudentToDto = (st: Student): StudentDto => ({
      id: st.id,
      firstName: st.firstName,
      lastName: st.lastName,
      email: st.email,
      studentId: st.studentId,
      dateOfBirth: st.dateOfBirth,
      createdAt: st.createdAt,
      updatedAt: st.updatedAt,
      classId: st.classId,
      schoolId: st.schoolId,
      currentClassName: st.currentClass ? st.currentClass.name : null,
    });

    const classDto = new ClassDto({
      id: classEntity.id,
      name: classEntity.name,
      level: classEntity.level,
      homeroomTeacherId: classEntity.homeroomTeacherId,
      createdAt: classEntity.createdAt,
      updatedAt: classEntity.updatedAt,
      schoolId: classEntity.schoolId,
    });

    if (classEntity.subjects) {
      classDto.subjects = classEntity.subjects.map(subject => new SubjectDto({ // Assuming SubjectDto is simple or defined elsewhere
        id: subject.id,
        name: subject.name,
        code: subject.code,
        description: subject.description,
        createdAt: subject.createdAt,
        updatedAt: subject.updatedAt,
        schoolId: subject.schoolId, // Assuming SubjectDto will also have schoolId
      }));
    }
    if (classEntity.students) {
      classDto.students = classEntity.students.map(mapStudentToDto);
    }
    return classDto;
  }

  private mapSubjectToSubjectDto(subjectEntity: SubjectEntity): SubjectDto {
    return new SubjectDto({
        id: subjectEntity.id,
        name: subjectEntity.name,
        code: subjectEntity.code,
        description: subjectEntity.description,
        createdAt: subjectEntity.createdAt,
        updatedAt: subjectEntity.updatedAt,
        schoolId: subjectEntity.schoolId, // Assuming SubjectDto will also have schoolId
    });
  }

  async create(createClassDto: CreateClassDto, schoolId: string): Promise<ClassDto> {
    const { name, homeroomTeacherId } = createClassDto;

    const existingClass = await this.classesRepository.findOne({ where: { name, schoolId } });
    if (existingClass) {
      throw new ConflictException(`Class with name "${name}" already exists in this school.`);
    }

    if (homeroomTeacherId) {
      const teacher = await this.usersService.findOneEntity(homeroomTeacherId, schoolId);
      if (!teacher) {
        throw new NotFoundException(`Homeroom teacher with ID "${homeroomTeacherId}" not found in this school.`);
      }
      if (!teacher.roles.includes(UserRole.TEACHER)) {
        throw new ConflictException(`User with ID "${homeroomTeacherId}" is not a teacher.`);
      }
    }

    try {
      const classToCreate = this.classesRepository.create({
        ...createClassDto,
        schoolId,
      });
      const savedClass = await this.classesRepository.save(classToCreate);
      return this.mapClassToClassDto(savedClass);
    } catch (error) {
      if (error instanceof QueryFailedError && (error as any).code === '23505') {
        if (error.message.includes('classes_name_school_id_idx') || error.message.includes('UQ_classes_name_schoolId')) {
             throw new ConflictException(`Class with name "${name}" already exists in this school.`);
        }
      }
      throw new InternalServerErrorException('Error creating class.');
    }
  }

  async findAll(schoolId: string): Promise<ClassDto[]> {
    const classes = await this.classesRepository.find({
      where: { schoolId },
      relations: ['subjects'], // Load subjects for the list view DTO
    });
    return classes.map(classEntity => this.mapClassToClassDto(classEntity));
  }

  async findOne(id: string, schoolId: string): Promise<ClassDto> {
    const classEntity = await this.classesRepository.findOne({
        where: { id, schoolId },
        relations: ['subjects', 'students', 'students.currentClass', 'students.school']
    });
    if (!classEntity) {
      throw new NotFoundException(`Class with ID "${id}" not found in this school.`);
    }
    return this.mapClassToClassDto(classEntity);
  }

  async update(id: string, updateClassDto: UpdateClassDto, schoolId: string): Promise<ClassDto> {
    const { name, homeroomTeacherId, ...restOfDto } = updateClassDto;

    const classToUpdate = await this.classesRepository.findOneBy({ id, schoolId });
    if (!classToUpdate) {
      throw new NotFoundException(`Class with ID "${id}" not found in this school.`);
    }

    if (name && name !== classToUpdate.name) {
      const existingClass = await this.classesRepository.findOne({ where: { name, schoolId } });
      if (existingClass && existingClass.id !== id) {
        throw new ConflictException(`Class with name "${name}" already exists in this school.`);
      }
      classToUpdate.name = name;
    }

    if (updateClassDto.hasOwnProperty('homeroomTeacherId')) {
      if (homeroomTeacherId) {
        const teacher = await this.usersService.findOneEntity(homeroomTeacherId, schoolId);
        if (!teacher) {
          throw new NotFoundException(`Homeroom teacher with ID "${homeroomTeacherId}" not found in this school.`);
        }
        if (!teacher.roles.includes(UserRole.TEACHER)) {
          throw new ConflictException(`User with ID "${homeroomTeacherId}" is not a teacher.`);
        }
        classToUpdate.homeroomTeacherId = homeroomTeacherId;
      } else {
        classToUpdate.homeroomTeacherId = null;
      }
    }

    Object.assign(classToUpdate, restOfDto);

    try {
      const updatedClass = await this.classesRepository.save(classToUpdate);
      return this.findOne(updatedClass.id, schoolId);
    } catch (error) {
      if (error instanceof QueryFailedError && (error as any).code === '23505') {
        if (error.message.includes('classes_name_school_id_idx') || error.message.includes('UQ_classes_name_schoolId')) {
             throw new ConflictException(`Class with name "${classToUpdate.name || name}" already exists in this school.`);
        }
      }
      throw new InternalServerErrorException('Error updating class.');
    }
  }

  async remove(id: string, schoolId: string): Promise<void> {
    const classEntity = await this.classesRepository.findOneBy({ id, schoolId });
    if (!classEntity) {
      throw new NotFoundException(`Class with ID "${id}" not found in this school.`);
    }
    const result = await this.classesRepository.delete({ id, schoolId });
    if (result.affected === 0) {
      throw new NotFoundException(`Class with ID "${id}" in this school could not be deleted or was already deleted.`);
    }
  }

  async assignSubjectToClass(classId: string, subjectId: string, schoolId: string): Promise<ClassDto> {
    const classEntity = await this.classesRepository.findOne({ where: { id: classId, schoolId }, relations: ['subjects'] });
    if (!classEntity) {
      throw new NotFoundException(`Class with ID "${classId}" not found in this school.`);
    }

    const subjectEntity = await this.subjectsRepository.findOneBy({ id: subjectId, schoolId }); // Ensure subject is in the same school
    if (!subjectEntity) {
      throw new NotFoundException(`Subject with ID "${subjectId}" not found in this school.`);
    }

    const subjectAlreadyAssigned = classEntity.subjects.some(subject => subject.id === subjectId);
    if (!subjectAlreadyAssigned) {
        classEntity.subjects.push(subjectEntity);
        await this.classesRepository.save(classEntity);
    }
    // It's important to re-fetch or ensure relations are correctly populated for the DTO.
    // Calling findOne ensures this.
    return this.findOne(classId, schoolId);
  }

  async removeSubjectFromClass(classId: string, subjectId: string, schoolId: string): Promise<ClassDto> {
    const classEntity = await this.classesRepository.findOne({ where: { id: classId, schoolId }, relations: ['subjects'] });
    if (!classEntity) {
      throw new NotFoundException(`Class with ID "${classId}" not found in this school.`);
    }

    const initialNumberOfSubjects = classEntity.subjects.length;
    classEntity.subjects = classEntity.subjects.filter(subject => subject.id !== subjectId);

    if (classEntity.subjects.length === initialNumberOfSubjects) {
        throw new NotFoundException(`Subject with ID "${subjectId}" not found in class "${classId}" or already removed.`);
    }

    await this.classesRepository.save(classEntity);
    return this.findOne(classId, schoolId);
  }

  async listSubjectsForClass(classId: string, schoolId: string): Promise<SubjectDto[]> {
    const classEntity = await this.classesRepository.findOne({ where: { id: classId, schoolId }, relations: ['subjects'] });
    if (!classEntity) {
      throw new NotFoundException(`Class with ID "${classId}" not found in this school.`);
    }
    return classEntity.subjects.map(subject => this.mapSubjectToSubjectDto(subject));
  }

  async listStudentsInClass(classId: string, schoolId: string): Promise<StudentDto[]> {
    const classEntity = await this.classesRepository.findOne({
      where: { id: classId, schoolId },
      relations: ['students', 'students.currentClass', 'students.school'],
    });

    if (!classEntity) {
      throw new NotFoundException(`Class with ID "${classId}" not found in this school`);
    }
    if (!classEntity.students) {
      return [];
    }
    // Corrected mapping:
    const mapStudentToDto = (st: Student): StudentDto => ({
      id: st.id,
      firstName: st.firstName,
      lastName: st.lastName,
      email: st.email,
      studentId: st.studentId,
      dateOfBirth: st.dateOfBirth,
      createdAt: st.createdAt,
      updatedAt: st.updatedAt,
      classId: st.classId,
      schoolId: st.schoolId,
      currentClassName: st.currentClass ? st.currentClass.name : null,
    });
    return classEntity.students.map(mapStudentToDto);
  }
}
