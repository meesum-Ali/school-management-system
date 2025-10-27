import { Injectable } from '@nestjs/common';
import { IStudentRepository } from '../../domain/repositories';
import { Student } from '../../domain/models';
import { StudentId, Email, DateOfBirth } from '../../domain/value-objects';
import { InvalidStudentException } from '../../domain/exceptions';
import { CreateStudentDto, StudentResponseDto } from '../dtos';

/**
 * Use Case: Create Student
 *
 * This use case orchestrates the creation of a new student aggregate.
 * It validates business rules (e.g., email uniqueness) and persists the aggregate.
 */
@Injectable()
export class CreateStudentUseCase {
  constructor(private readonly studentRepository: IStudentRepository) {}

  async execute(dto: CreateStudentDto): Promise<StudentResponseDto> {
    // 1. Create value objects (will throw if invalid)
    const email = Email.create(dto.email);
    const dateOfBirth = DateOfBirth.create(dto.dateOfBirth);

    // 2. Check if email already exists in the school
    const emailExists = await this.studentRepository.emailExists(
      email,
      dto.schoolId,
    );

    if (emailExists) {
      throw new InvalidStudentException(
        `Email already exists in this school: ${dto.email}`,
      );
    }

    // 3. Create student aggregate (will throw if invalid)
    const student = Student.create({
      id: StudentId.generate(),
      firstName: dto.firstName,
      lastName: dto.lastName,
      email,
      dateOfBirth,
      schoolId: dto.schoolId,
      phoneNumber: dto.phoneNumber,
      address: dto.address,
    });

    // 4. Persist the aggregate
    const savedStudent = await this.studentRepository.save(student);

    // 5. Map to response DTO
    return this.toResponseDto(savedStudent);
  }

  private toResponseDto(student: Student): StudentResponseDto {
    return {
      id: student.getId().getValue(),
      firstName: student.getFirstName(),
      lastName: student.getLastName(),
      fullName: student.getFullName(),
      email: student.getEmail().getValue(),
      dateOfBirth: student.getDateOfBirth().getValue().toISOString(),
      age: student.getAge(),
      isMinor: student.isMinor(),
      schoolId: student.getSchoolId(),
      phoneNumber: student.getPhoneNumber(),
      address: student.getAddress(),
      classId: student.getClassId(),
      isEnrolled: student.isEnrolled(),
    };
  }
}
