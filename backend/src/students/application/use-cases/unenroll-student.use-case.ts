import { Injectable } from '@nestjs/common';
import { IStudentRepository } from '../../domain/repositories';
import { StudentId } from '../../domain/value-objects';
import { InvalidStudentException } from '../../domain/exceptions';
import { UnenrollStudentDto, StudentResponseDto } from '../dtos';

/**
 * Use Case: Unenroll Student from Class
 */
@Injectable()
export class UnenrollStudentUseCase {
  constructor(private readonly studentRepository: IStudentRepository) {}

  async execute(dto: UnenrollStudentDto): Promise<StudentResponseDto> {
    // 1. Find the student
    const studentId = StudentId.create(dto.studentId);
    const student = await this.studentRepository.findById(
      studentId,
      dto.schoolId,
    );

    if (!student) {
      throw new InvalidStudentException(`Student not found: ${dto.studentId}`);
    }

    // 2. Unenroll student (domain logic validates unenrollment rules)
    student.unenroll();

    // 3. Persist changes
    const savedStudent = await this.studentRepository.save(student);

    // 4. Return response
    return {
      id: savedStudent.getId().getValue(),
      firstName: savedStudent.getFirstName(),
      lastName: savedStudent.getLastName(),
      fullName: savedStudent.getFullName(),
      email: savedStudent.getEmail().getValue(),
      dateOfBirth: savedStudent.getDateOfBirth().getValue().toISOString(),
      age: savedStudent.getAge(),
      isMinor: savedStudent.isMinor(),
      schoolId: savedStudent.getSchoolId(),
      phoneNumber: savedStudent.getPhoneNumber(),
      address: savedStudent.getAddress(),
      classId: savedStudent.getClassId(),
      isEnrolled: savedStudent.isEnrolled(),
    };
  }
}
