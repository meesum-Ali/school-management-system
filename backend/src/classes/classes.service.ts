import { Injectable, Logger, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { ClassEntity } from './entities/class.entity';
import { SubjectEntity } from '../subjects/entities/subject.entity';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { ClassDto } from './dto/class.dto';
import { SubjectBasicDto } from '../subjects/dto/subject-basic.dto';
import { StudentDto } from '../students/dto/student.dto';
import { Student } from '../students/entities/student.entity';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class ClassesService {
  private readonly logger = new Logger(ClassesService.name);

  constructor(
    @InjectRepository(ClassEntity)
    private classesRepository: Repository<ClassEntity>,
    @InjectRepository(SubjectEntity)
    private subjectsRepository: Repository<SubjectEntity>,
    private usersService: UsersService,
  ) {}

  private async mapClassToClassDto(classEntity: ClassEntity): Promise<ClassDto> {
    const mapStudentToDto = async (st: Student): Promise<StudentDto> => {
      const currentClass = st.currentClass ? await st.currentClass : null;
      return {
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
        currentClassName: currentClass ? currentClass.name : null,
      };
    };

    // Map subjects to SubjectBasicDto
    let subjects: SubjectBasicDto[] = [];
    if (classEntity.subjects) {
      const loadedSubjects = await classEntity.subjects;
      subjects = loadedSubjects.map(subject => ({
        id: subject.id,
        name: subject.name,
        code: subject.code,
        description: subject.description,
        createdAt: subject.createdAt,
        updatedAt: subject.updatedAt,
        schoolId: subject.schoolId
      }));
    }

    const classDto = new ClassDto({
      id: classEntity.id,
      name: classEntity.name,
      level: classEntity.level,
      homeroomTeacherId: classEntity.homeroomTeacherId,
      subjects,
      createdAt: classEntity.createdAt,
      updatedAt: classEntity.updatedAt,
      schoolId: classEntity.schoolId,
    });

    if (classEntity.subjects) {
      const subjects = await classEntity.subjects;
      classDto.subjects = subjects.map(subject => this.mapSubjectToBasicDto(subject));
    }
    
    if (classEntity.students) {
      const students = await classEntity.students;
      const studentDtos = await Promise.all(students.map(mapStudentToDto));
      classDto.students = studentDtos;
    }
    
    return classDto;
  }

  private mapSubjectToBasicDto(subjectEntity: SubjectEntity): SubjectBasicDto {
    return {
      id: subjectEntity.id,
      name: subjectEntity.name,
      code: subjectEntity.code,
      description: subjectEntity.description,
      createdAt: subjectEntity.createdAt,
      updatedAt: subjectEntity.updatedAt,
      schoolId: subjectEntity.schoolId,
    };
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

  async listClasses(schoolId: string): Promise<ClassDto[]> {
    const classes = await this.classesRepository.find({
      where: { schoolId },
      relations: ['subjects', 'students']
    });
    const classDtos = await Promise.all(classes.map(cls => this.mapClassToClassDto(cls)));
    return classDtos;
  }

  async findAll(schoolId: string): Promise<ClassDto[]> {
    const classes = await this.classesRepository.find({
      where: { schoolId },
      relations: ['subjects', 'students']
    });
    const classDtos = await Promise.all(classes.map(classEntity => this.mapClassToClassDto(classEntity)));
    return classDtos;
  }

  async findOne(id: string, schoolId: string): Promise<ClassDto> {
    const classEntity = await this.classesRepository.findOne({
      where: { id, schoolId },
      relations: ['subjects', 'students']
    });

    if (!classEntity) {
      throw new NotFoundException(`Class with ID "${id}" not found in this school.`);
    }

    return await this.mapClassToClassDto(classEntity);
  }

  async update(id: string, updateClassDto: UpdateClassDto, schoolId: string): Promise<ClassDto> {
    const { name, homeroomTeacherId, ...restOfDto } = updateClassDto;

    // Load the class with relations to ensure we have everything we need
    const classToUpdate = await this.classesRepository.findOne({
      where: { id, schoolId },
      relations: ['subjects', 'students']
    });
    
    if (!classToUpdate) {
      throw new NotFoundException(`Class with ID "${id}" not found in this school.`);
    }

    if (name && name !== classToUpdate.name) {
      const existingClass = await this.classesRepository.findOne({ 
        where: { name, schoolId },
        withDeleted: true // Include soft-deleted classes in the check
      });
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

    // Update other properties
    Object.assign(classToUpdate, restOfDto);

    try {
      const updatedClass = await this.classesRepository.save(classToUpdate);
      // Return the updated class with all relationships properly loaded
      return await this.findOne(updatedClass.id, schoolId);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        // Handle unique constraint violations
        if (error.message.includes('duplicate key value') || 
            (error as any).code === '23505') {
          throw new ConflictException(`Class with name "${classToUpdate.name || name}" already exists in this school.`);
        }
      }
      throw new InternalServerErrorException('Error updating class.');
    }
  }

  async remove(id: string, schoolId: string): Promise<void> {
    // First check if the class exists with the given school ID
    const classEntity = await this.classesRepository.findOne({
      where: { id, schoolId },
      relations: ['students', 'subjects'] // Load relationships to check for dependencies
    });
    
    if (!classEntity) {
      throw new NotFoundException(`Class with ID "${id}" not found in this school.`);
    }

    // Check if there are any students still assigned to this class
    const students = await classEntity.students;
    if (students && students.length > 0) {
      throw new ConflictException(
        `Cannot delete class "${classEntity.name}" because it still has ${students.length} student(s) assigned. ` +
        'Please reassign or remove all students before deleting this class.'
      );
    }

    // Remove relationships before deleting
    const subjects = await classEntity.subjects;
    if (subjects && subjects.length > 0) {
      // Remove all subject associations
      classEntity.subjects = Promise.resolve([]);
      await this.classesRepository.save(classEntity);
    }

    // Now delete the class
    const result = await this.classesRepository.delete({ id, schoolId });
    if (result.affected === 0) {
      throw new NotFoundException(
        `Class with ID "${id}" could not be deleted or was already deleted.`
      );
    }
  }

  async assignSubject(classId: string, subjectId: string, schoolId: string): Promise<SubjectBasicDto> {
    // First validate that both class and subject exist and belong to the school
    const [classEntity, subject] = await Promise.all([
      this.classesRepository.findOne({ 
        where: { id: classId, schoolId },
        relations: ['subjects']
      }),
      this.subjectsRepository.findOne({ 
        where: { id: subjectId, schoolId },
        relations: ['classes']
      })
    ]);

    if (!classEntity) {
      throw new NotFoundException(`Class with ID "${classId}" not found in this school.`);
    }
    if (!subject) {
      throw new NotFoundException(`Subject with ID "${subjectId}" not found in this school.`);
    }

    // Check if subject is already assigned to this class
    const subjects = await classEntity.subjects;
    const subjectAlreadyAssigned = subjects.some(subject => subject.id === subjectId);
    if (subjectAlreadyAssigned) {
      throw new ConflictException(
        `Subject "${subject.name}" (ID: ${subjectId}) is already assigned to class "${classEntity.name}"`
      );
    }

    try {
      // Add the subject to the class's subjects
      const updatedSubjects = [...subjects, subject];
      classEntity.subjects = Promise.resolve(updatedSubjects);
      
      // Save the updated class with the new subject
      await this.classesRepository.save(classEntity);
      
      // Return the subject DTO
      return this.mapSubjectToBasicDto(subject);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        this.logger.error(`Failed to assign subject ${subjectId} to class ${classId}: ${error.message}`, error.stack);
        throw new InternalServerErrorException('Failed to assign subject to class. Please try again later.');
      }
      throw error;
    }
  }

  async removeSubjectFromClass(classId: string, subjectId: string, schoolId: string): Promise<ClassDto> {
    // First validate that both class and subject exist and belong to the school
    const [classEntity, subjectEntity] = await Promise.all([
      this.classesRepository.findOne({ 
        where: { id: classId, schoolId },
        relations: ['subjects']
      }),
      this.subjectsRepository.findOne({ 
        where: { id: subjectId, schoolId }
      })
    ]);

    if (!classEntity) {
      throw new NotFoundException(`Class with ID "${classId}" not found in this school.`);
    }
    if (!subjectEntity) {
      throw new NotFoundException(`Subject with ID "${subjectId}" not found in this school.`);
    }

    // Get current subjects and check if the subject is assigned to the class
    const currentSubjects = await classEntity.subjects;
    const subjectIndex = currentSubjects.findIndex(s => s.id === subjectId);
    
    if (subjectIndex === -1) {
      throw new NotFoundException(
        `Subject "${subjectEntity.name}" (ID: ${subjectId}) is not assigned to class "${classEntity.name}"`
      );
    }
    
    // Remove the subject from the class's subjects
    const updatedSubjects = [...currentSubjects];
    updatedSubjects.splice(subjectIndex, 1);
    classEntity.subjects = Promise.resolve(updatedSubjects);

    try {
      // Save the updated class
      await this.classesRepository.save(classEntity);
      this.logger.log(`Successfully removed subject "${subjectEntity.name}" from class "${classEntity.name}"`);
      
      // Return the updated class with all relationships properly loaded
      return await this.findOne(classId, schoolId);
    } catch (error) {
      this.logger.error(
        `Failed to remove subject ${subjectId} from class ${classId}: ${error.message}`,
        error.stack
      );
      
      if (error instanceof QueryFailedError) {
        throw new InternalServerErrorException(
          'Failed to remove subject from class. Please try again later.'
        );
      }
      throw error;
    }
  }

  async listSubjectsForClass(classId: string, schoolId: string): Promise<SubjectBasicDto[]> {
    // First validate that the class exists and belongs to the school
    const classEntity = await this.classesRepository.findOne({
      where: { id: classId, schoolId },
      relations: ['subjects']
    });

    if (!classEntity) {
      throw new NotFoundException(`Class with ID "${classId}" not found in this school.`);
    }

    // Get the subjects with their relations if needed
    const subjects = await classEntity.subjects;
    
    // Map to basic DTOs
    return subjects.map(subject => this.mapSubjectToBasicDto(subject));
  }

  async listStudentsInClass(classId: string, schoolId: string): Promise<StudentDto[]> {
    // First validate the class exists and belongs to the school
    const classEntity = await this.classesRepository.findOne({
      where: { id: classId, schoolId },
      relations: ['students']
    });

    if (!classEntity) {
      throw new NotFoundException(`Class with ID "${classId}" not found in this school.`);
    }

    try {
      // Get the students with their relationships properly loaded
      const students = await classEntity.students;
      
      // Map each student to its DTO with proper error handling
      const studentDtos = await Promise.all(students.map(async (student) => {
        try {
          const currentClass = student.currentClass ? await student.currentClass : null;
          return {
            id: student.id,
            firstName: student.firstName,
            lastName: student.lastName,
            email: student.email,
            studentId: student.studentId,
            dateOfBirth: student.dateOfBirth,
            createdAt: student.createdAt,
            updatedAt: student.updatedAt,
            classId: student.classId,
            schoolId: student.schoolId,
            currentClassName: currentClass ? currentClass.name : null,
          };
        } catch (error) {
          this.logger.error(
            `Error processing student ${student.id} in class ${classId}: ${error.message}`,
            error.stack
          );
          // Return partial data for this student if there's an error
          return {
            id: student.id,
            firstName: student.firstName,
            lastName: student.lastName,
            email: student.email,
            studentId: student.studentId,
            dateOfBirth: student.dateOfBirth,
            error: 'Error loading student details'
          } as unknown as StudentDto; // Type assertion to handle partial data
        }
      }));

      return studentDtos;
    } catch (error) {
      this.logger.error(
        `Failed to list students for class ${classId}: ${error.message}`,
        error.stack
      );
      throw new InternalServerErrorException('Failed to retrieve students for the class.');
    }
  }
}
