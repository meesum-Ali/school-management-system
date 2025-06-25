import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { Student } from './entities/student.entity';
import { ClassEntity } from '../classes/entities/class.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentDto } from './dto/student.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
    @InjectRepository(ClassEntity) // Add this
    private classesRepository: Repository<ClassEntity>, // Add this
  ) {}

  private async mapStudentToStudentDto(student: Student): Promise<StudentDto> {
    // Handle the lazy-loaded currentClass
    let currentClassName = null;
    if (student.currentClass) {
      try {
        const currentClass = await student.currentClass;
        currentClassName = currentClass?.name || null;
      } catch (error) {
        console.error(`Error loading currentClass for student ${student.id}:`, error);
      }
    }

    return {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      dateOfBirth: student.dateOfBirth,
      email: student.email,
      studentId: student.studentId,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
      classId: student.classId,
      currentClassName: currentClassName,
      schoolId: student.schoolId,
    };
  }

  async create(createStudentDto: CreateStudentDto, schoolId: string): Promise<StudentDto> {
    const { studentId: studentIdFromDto, email, classId } = createStudentDto;

    // Check for existing studentId or email within the given school
    const existingStudent = await this.studentsRepository.findOne({
      where: [
        { studentId: studentIdFromDto, schoolId },
        { email, schoolId },
      ],
    });

    if (existingStudent) {
      if (existingStudent.studentId === studentIdFromDto) {
        throw new ConflictException(`Student ID "${studentIdFromDto}" already exists in this school.`);
      }
      if (existingStudent.email === email) {
        throw new ConflictException(`Email "${email}" already exists in this school.`);
      }
    }

    try {
      const studentToCreate = this.studentsRepository.create({
        ...createStudentDto,
        schoolId, // Set the schoolId from context
      });

      if (classId) {
        const classExists = await this.classesRepository.findOneBy({ id: classId, schoolId }); // Ensure class is in the same school
        if (!classExists) {
          throw new NotFoundException(`Class with ID "${classId}" not found in this school.`);
        }
        studentToCreate.classId = classId;
      }

      const savedStudent = await this.studentsRepository.save(studentToCreate);
      // Always fetch the student with relations to ensure all data is loaded
      const studentWithRelations = await this.studentsRepository.findOne({
        where: { id: savedStudent.id },
        relations: ['currentClass']
      });
      
      if (!studentWithRelations) {
        throw new NotFoundException('Failed to create student');
      }
      
      return await this.mapStudentToStudentDto(studentWithRelations);
    } catch (error) {
      if (error instanceof QueryFailedError && (error as any).code === '23505') { // Unique constraint violation
        if (error.message.includes('studentId')) { // Check specific constraint name if possible
             throw new ConflictException(`Student ID "${createStudentDto.studentId}" already exists.`);
        } else if (error.message.includes('email')) {
             throw new ConflictException(`Email "${createStudentDto.email}" already exists.`);
        }
      }
      throw new InternalServerErrorException('Error creating student.');
    }
  }

  async findAll(schoolId: string): Promise<StudentDto[]> {
    // Students must belong to a school, so schoolId is mandatory for filtering.
    // SUPER_ADMIN might need a different method or controller endpoint to see all students across all schools.
    const students = await this.studentsRepository.find({
      where: { schoolId },
      relations: ['currentClass'], // Ensure class info is loaded for DTO mapping
    });
    
    // Use Promise.all to await all the async mapping operations
    const studentDtos = await Promise.all(
      students.map(student => this.mapStudentToStudentDto(student))
    );
    
    return studentDtos;
  }

  async findOne(id: string, schoolId: string): Promise<StudentDto> { // ID is now string (UUID)
    const student = await this.studentsRepository.findOne({
      where: { id, schoolId }, // Ensure student belongs to the specified school
      relations: ['currentClass'],
    });
    if (!student) {
      throw new NotFoundException(`Student with ID "${id}" not found in this school.`);
    }
    return await this.mapStudentToStudentDto(student);
  }

  async update(id: string, updateStudentDto: UpdateStudentDto, schoolId: string): Promise<StudentDto> {
    const { studentId: newStudentId, email: newEmail, classId: newClassId, ...restOfDto } = updateStudentDto;

    // First, ensure the student exists and belongs to the specified school
    const studentToUpdate = await this.studentsRepository.findOne({
      where: { id, schoolId },
      relations: ['currentClass'] // Load the currentClass relation
    });
    
    if (!studentToUpdate) {
      throw new NotFoundException(`Student with ID "${id}" not found in this school.`);
    }

    // Handle class assignment: ensure new class (if any) belongs to the same school
    if (newClassId !== undefined) {
      if (newClassId === null) {
        studentToUpdate.classId = null;
        studentToUpdate.currentClass = null;
      } else {
        const classExists = await this.classesRepository.findOneBy({ id: newClassId, schoolId });
        if (!classExists) {
          throw new NotFoundException(`Class with ID "${newClassId}" not found in this school.`);
        }
        studentToUpdate.classId = newClassId;
        studentToUpdate.currentClass = Promise.resolve(classExists);
      }
    }

    // Check for duplicate studentId within the same school
    if (newStudentId && newStudentId !== studentToUpdate.studentId) {
      const existingStudentWithId = await this.studentsRepository.findOne({
        where: { studentId: newStudentId, schoolId },
      });
      if (existingStudentWithId && existingStudentWithId.id !== id) {
        throw new ConflictException(`Student ID "${newStudentId}" is already in use by another student in this school.`);
      }
      studentToUpdate.studentId = newStudentId;
    }

    // Check for duplicate email within the same school
    if (newEmail && newEmail !== studentToUpdate.email) {
      const existingStudentWithEmail = await this.studentsRepository.findOne({
        where: { email: newEmail, schoolId },
      });
      if (existingStudentWithEmail && existingStudentWithEmail.id !== id) {
        throw new ConflictException(`Email "${newEmail}" is already in use by another student in this school.`);
      }
      studentToUpdate.email = newEmail;
    }

    // Update other fields
    Object.assign(studentToUpdate, restOfDto);

    try {
      const updatedStudent = await this.studentsRepository.save(studentToUpdate);
      return await this.mapStudentToStudentDto(updatedStudent);
    } catch (error) {
        if (error instanceof QueryFailedError && (error as any).code === '23505') {
             if (error.message.includes('studentId')) {
                 throw new ConflictException(`Student ID "${updateStudentDto.studentId}" already exists.`);
            } else if (error.message.includes('email')) {
                 throw new ConflictException(`Email "${updateStudentDto.email}" already exists.`);
            }
        }
        throw new InternalServerErrorException('Error updating student.');
    }
  }

  async remove(id: string, schoolId: string): Promise<void> {
    const student = await this.studentsRepository.findOneBy({ id, schoolId });
    if (!student) {
      throw new NotFoundException(`Student with ID "${id}" not found in this school.`);
    }
    const result = await this.studentsRepository.delete({ id, schoolId }); // Ensure delete is also scoped
    if (result.affected === 0) {
      throw new NotFoundException(`Student with ID "${id}" in this school could not be deleted or was already deleted.`);
    }
  }

  async assignStudentToClass(studentId: string, classId: string | null, schoolId: string): Promise<StudentDto> {
    const student = await this.studentsRepository.findOneBy({ id: studentId, schoolId });
    if (!student) {
      throw new NotFoundException(`Student with ID "${studentId}" not found in this school.`);
    }

    if (classId) {
      const classExists = await this.classesRepository.findOneBy({ id: classId, schoolId }); // Ensure class is in the same school
      if (!classExists) {
        throw new NotFoundException(`Class with ID "${classId}" not found in this school.`);
      }
    }

    student.classId = classId; // This will also set student.currentClass if relations are eager or reloaded
    const updatedStudent = await this.studentsRepository.save(student);
    // To include class name, we need to fetch the relation or ensure it's loaded
    // Re-fetch using findOne to ensure relations like currentClass are loaded for the DTO mapping
    return this.findOne(updatedStudent.id, schoolId);
  }
}
