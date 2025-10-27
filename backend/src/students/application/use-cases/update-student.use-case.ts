import { Injectable } from '@nestjs/common';
import { IStudentRepository } from '../../domain/repositories';
import { StudentId, Email } from '../../domain/value-objects';
import { InvalidStudentException } from '../../domain/exceptions';
import { UpdateStudentDto, StudentResponseDto } from '../dtos';

/**
 * Use Case: Update Student Profile
 */
@Injectable()
export class UpdateStudentUseCase {
  constructor(private readonly studentRepository: IStudentRepository) {}

  async execute(
    studentId: string,
    schoolId: string,
    dto: UpdateStudentDto,
  ): Promise<StudentResponseDto> {
    // 1. Find the student
    const id = StudentId.create(studentId);
    const student = await this.studentRepository.findById(id, schoolId);

    if (!student) {
      throw new InvalidStudentException(`Student not found: ${studentId}`);
    }

    // 2. Check email uniqueness if email is being updated
    if (dto.email && dto.email !== student.getEmail().getValue()) {
      const newEmail = Email.create(dto.email);
      const emailExists = await this.studentRepository.emailExists(
        newEmail,
        schoolId,
        id,
      );

      if (emailExists) {
        throw new InvalidStudentException(
          `Email already exists in this school: ${dto.email}`,
        );
      }
    }

    // 3. Create update payload with value objects
    const updatePayload: any = {};

    if (dto.firstName) updatePayload.firstName = dto.firstName;
    if (dto.lastName) updatePayload.lastName = dto.lastName;
    if (dto.email) updatePayload.email = Email.create(dto.email);
    if (dto.phoneNumber !== undefined)
      updatePayload.phoneNumber = dto.phoneNumber;
    if (dto.address !== undefined) updatePayload.address = dto.address;

    // 4. Update student (domain logic validates updates)
    student.updateProfile(updatePayload);

    // 5. Persist changes
    const savedStudent = await this.studentRepository.save(student);

    // 6. Return response
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
