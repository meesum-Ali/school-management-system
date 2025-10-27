import { Injectable } from '@nestjs/common';
import { IStudentRepository } from '../../domain/repositories';
import { StudentId, Email } from '../../domain/value-objects';
import { InvalidStudentException } from '../../domain/exceptions';
import { StudentResponseDto } from '../dtos';

/**
 * Use Case: Get Student by ID
 */
@Injectable()
export class GetStudentByIdUseCase {
  constructor(private readonly studentRepository: IStudentRepository) {}

  async execute(
    studentId: string,
    schoolId: string,
  ): Promise<StudentResponseDto> {
    const id = StudentId.create(studentId);
    const student = await this.studentRepository.findById(id, schoolId);

    if (!student) {
      throw new InvalidStudentException(`Student not found: ${studentId}`);
    }

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

/**
 * Use Case: Get Student by Email
 */
@Injectable()
export class GetStudentByEmailUseCase {
  constructor(private readonly studentRepository: IStudentRepository) {}

  async execute(email: string, schoolId: string): Promise<StudentResponseDto> {
    const emailVo = Email.create(email);
    const student = await this.studentRepository.findByEmail(emailVo, schoolId);

    if (!student) {
      throw new InvalidStudentException(
        `Student not found with email: ${email}`,
      );
    }

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

/**
 * Use Case: List Students
 */
@Injectable()
export class ListStudentsUseCase {
  constructor(private readonly studentRepository: IStudentRepository) {}

  async execute(
    schoolId: string,
    page?: number,
    limit?: number,
  ): Promise<StudentResponseDto[]> {
    const students = await this.studentRepository.findBySchool(
      schoolId,
      page,
      limit,
    );

    return students.map((student) => ({
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
    }));
  }
}

/**
 * Use Case: Get Students by Class
 */
@Injectable()
export class GetStudentsByClassUseCase {
  constructor(private readonly studentRepository: IStudentRepository) {}

  async execute(
    classId: string,
    schoolId: string,
  ): Promise<StudentResponseDto[]> {
    const students = await this.studentRepository.findByClass(
      classId,
      schoolId,
    );

    return students.map((student) => ({
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
    }));
  }
}
