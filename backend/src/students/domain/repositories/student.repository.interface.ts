import { Student } from '../models';
import { StudentId, Email } from '../value-objects';

/**
 * Repository Interface for Student Aggregate
 *
 * This interface defines the contract for persisting and retrieving Student aggregates.
 * It is part of the domain layer and has no knowledge of the underlying persistence mechanism.
 *
 * The infrastructure layer will provide an adapter that implements this interface.
 */
export interface IStudentRepository {
  /**
   * Save a student aggregate (create or update)
   * @param student The student aggregate to save
   * @returns The saved student aggregate
   */
  save(student: Student): Promise<Student>;

  /**
   * Find a student by their ID
   * @param id The student ID
   * @param schoolId The school ID for tenant isolation
   * @returns The student aggregate or null if not found
   */
  findById(id: StudentId, schoolId: string): Promise<Student | null>;

  /**
   * Find a student by their email
   * @param email The student email
   * @param schoolId The school ID for tenant isolation
   * @returns The student aggregate or null if not found
   */
  findByEmail(email: Email, schoolId: string): Promise<Student | null>;

  /**
   * Find all students for a specific school
   * @param schoolId The school ID for tenant isolation
   * @param page Optional page number for pagination (1-based)
   * @param limit Optional limit for pagination
   * @returns Array of student aggregates
   */
  findBySchool(
    schoolId: string,
    page?: number,
    limit?: number,
  ): Promise<Student[]>;

  /**
   * Find all students enrolled in a specific class
   * @param classId The class ID
   * @param schoolId The school ID for tenant isolation
   * @returns Array of student aggregates
   */
  findByClass(classId: string, schoolId: string): Promise<Student[]>;

  /**
   * Count students for a specific school
   * @param schoolId The school ID for tenant isolation
   * @returns Total count of students
   */
  count(schoolId: string): Promise<number>;

  /**
   * Delete a student
   * @param id The student ID
   * @param schoolId The school ID for tenant isolation
   * @returns True if deleted, false if not found
   */
  delete(id: StudentId, schoolId: string): Promise<boolean>;

  /**
   * Check if a student exists
   * @param id The student ID
   * @param schoolId The school ID for tenant isolation
   * @returns True if exists, false otherwise
   */
  exists(id: StudentId, schoolId: string): Promise<boolean>;

  /**
   * Check if an email is already in use
   * @param email The email to check
   * @param schoolId The school ID for tenant isolation
   * @param excludeId Optional student ID to exclude from check (for updates)
   * @returns True if email exists, false otherwise
   */
  emailExists(
    email: Email,
    schoolId: string,
    excludeId?: StudentId,
  ): Promise<boolean>;
}
