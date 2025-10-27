/**
 * Data Transfer Object for creating a student
 */
export class CreateStudentDto {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string; // ISO 8601 format
  schoolId: string;
  phoneNumber?: string;
  address?: string;
}

/**
 * Response DTO for student operations
 */
export class StudentResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  dateOfBirth: string;
  age: number;
  isMinor: boolean;
  schoolId: string;
  phoneNumber?: string;
  address?: string;
  classId: string | null;
  isEnrolled: boolean;
}

/**
 * Data Transfer Object for updating a student
 */
export class UpdateStudentDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
}

/**
 * Data Transfer Object for enrolling a student
 */
export class EnrollStudentDto {
  studentId: string;
  classId: string;
  schoolId: string;
}

/**
 * Data Transfer Object for unenrolling a student
 */
export class UnenrollStudentDto {
  studentId: string;
  schoolId: string;
}

/**
 * Query DTO for getting student by ID
 */
export class GetStudentByIdDto {
  studentId: string;
  schoolId: string;
}

/**
 * Query DTO for getting student by email
 */
export class GetStudentByEmailDto {
  email: string;
  schoolId: string;
}

/**
 * Query DTO for listing students
 */
export class ListStudentsDto {
  schoolId: string;
  page?: number;
  limit?: number;
}

/**
 * Query DTO for getting students by class
 */
export class GetStudentsByClassDto {
  classId: string;
  schoolId: string;
}
