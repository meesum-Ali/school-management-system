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

  private mapStudentToStudentDto(student: Student): StudentDto {
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
      currentClassName: student.currentClass ? student.currentClass.name : null,
    };
  }

  async create(createStudentDto: CreateStudentDto): Promise<StudentDto> {
    const { studentId, email, classId } = createStudentDto;

    const existingStudent = await this.studentsRepository.findOne({
      where: [{ studentId }, { email }],
    });

    if (existingStudent) {
      if (existingStudent.studentId === studentId) {
        throw new ConflictException(`Student ID "${studentId}" already exists`);
      }
      if (existingStudent.email === email) {
        throw new ConflictException(`Email "${email}" already exists`);
      }
    }

    try {
      // TypeORM's `create` method only creates an entity instance from the DTO,
      // it doesn't save it. We need to explicitly call `save`.
      const studentEntity = this.studentsRepository.create(createStudentDto);

      if (classId) {
        const classExists = await this.classesRepository.findOneBy({ id: classId });
        if (!classExists) {
          throw new NotFoundException(`Class with ID "${classId}" not found.`);
        }
        studentEntity.classId = classId; // Assign directly if not handled by create
      }

      const savedStudent = await this.studentsRepository.save(studentEntity);
      // If classId was assigned, we might want to fetch the student with relation for mapStudentToStudentDto
      if (savedStudent.classId) {
        const studentWithRelation = await this.studentsRepository.findOne({
            where: { id: savedStudent.id },
            relations: ['currentClass'],
        });
        return this.mapStudentToStudentDto(studentWithRelation);
      }
      return this.mapStudentToStudentDto(savedStudent);
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

  async findAll(): Promise<StudentDto[]> {
    const students = await this.studentsRepository.find();
    return students.map(student => this.mapStudentToStudentDto(student));
  }

  async findOne(id: string): Promise<StudentDto> { // ID is now string (UUID)
    const student = await this.studentsRepository.findOne({
      where: { id },
      relations: ['currentClass'], // Add this to load the class relation
    });
    if (!student) {
      throw new NotFoundException(`Student with ID "${id}" not found`);
    }
    return this.mapStudentToStudentDto(student);
  }

  async update(id: string, updateStudentDto: UpdateStudentDto): Promise<StudentDto> { // ID is now string
    // const { studentId, email, ...restOfDto } = updateStudentDto; // classId needs to be handled
    const { studentId, email, classId: newClassId } = updateStudentDto;


    if (newClassId !== undefined) { // Check if classId is explicitly part of the update
      if (newClassId === null) { // Un-assigning from class
        // Handled by preload if classId: null is in updateStudentDto
      } else { // Assigning to a new class
        const classExists = await this.classesRepository.findOneBy({ id: newClassId });
        if (!classExists) {
          throw new NotFoundException(`Class with ID "${newClassId}" not found.`);
        }
      }
    }

    if (studentId) {
      const existing = await this.studentsRepository.findOne({ where: { studentId } });
      if (existing && existing.id !== id) {
        throw new ConflictException(`Student ID "${studentId}" already exists for another student.`);
      }
    }
    if (email) {
      const existing = await this.studentsRepository.findOne({ where: { email } });
      if (existing && existing.id !== id) {
        throw new ConflictException(`Email "${email}" already exists for another student.`);
      }
    }

    // Preload fetches the entity and merges the DTO. This ensures we're working with an existing entity.
    const studentToUpdate = await this.studentsRepository.preload({
      id: id,
      ...updateStudentDto, // Spread the whole DTO
    });

    if (!studentToUpdate) {
      throw new NotFoundException(`Student with ID "${id}" not found`);
    }

    try {
        const updatedStudent = await this.studentsRepository.save(studentToUpdate);
        return this.mapStudentToStudentDto(updatedStudent);
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

  async remove(id: string): Promise<void> { // ID is now string
    const student = await this.studentsRepository.findOneBy({ id }); // Check if student exists first
    if (!student) {
      throw new NotFoundException(`Student with ID "${id}" not found`);
    }
    const result = await this.studentsRepository.delete(id);
    if (result.affected === 0) {
      // This might be redundant if findOneBy already threw, but good as a safeguard
      throw new NotFoundException(`Student with ID "${id}" could not be deleted or was already deleted.`);
    }
  }

  async assignStudentToClass(studentId: string, classId: string | null): Promise<StudentDto> {
    const student = await this.studentsRepository.findOneBy({ id: studentId });
    if (!student) {
      throw new NotFoundException(`Student with ID "${studentId}" not found`);
    }

    if (classId) {
      const classExists = await this.classesRepository.findOneBy({ id: classId });
      if (!classExists) {
        throw new NotFoundException(`Class with ID "${classId}" not found`);
      }
    }

    student.classId = classId;
    const updatedStudent = await this.studentsRepository.save(student);
    // To include class name, we need to fetch the relation or ensure it's loaded
    // Re-fetch using findOne to ensure relations like currentClass are loaded for the DTO mapping
    return this.findOne(updatedStudent.id);
  }
}
