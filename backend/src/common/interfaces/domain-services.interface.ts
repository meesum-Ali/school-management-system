/**
 * Domain Service Interfaces
 *
 * These interfaces define clear contracts for inter-module communication
 * following Domain-Driven Design (DDD) principles.
 *
 * Benefits:
 * - Clear boundaries between modules
 * - Testability (can mock interfaces)
 * - Flexibility for future refactoring (e.g., microservices)
 * - Documentation of expected behavior
 */

/**
 * Interface for Class domain service operations
 * Used by other modules to interact with the Classes domain
 */
export interface IClassesService {
  /**
   * Find a class by ID within a specific school
   * @param id - Class UUID
   * @param schoolId - School UUID
   * @returns ClassDto or throws NotFoundException
   */
  findOne(id: string, schoolId: string): Promise<any>;

  /**
   * Check if a class exists in a school
   * @param classId - Class UUID
   * @param schoolId - School UUID
   * @returns boolean indicating existence
   */
  exists?(classId: string, schoolId: string): Promise<boolean>;
}

/**
 * Interface for Subject domain service operations
 * Used by other modules to interact with the Subjects domain
 */
export interface ISubjectsService {
  /**
   * Find a subject by ID within a specific school
   * @param id - Subject UUID
   * @param schoolId - School UUID
   * @returns SubjectDto or throws NotFoundException
   */
  findOne(id: string, schoolId: string): Promise<any>;

  /**
   * Check if a subject exists in a school
   * @param subjectId - Subject UUID
   * @param schoolId - School UUID
   * @returns boolean indicating existence
   */
  exists?(subjectId: string, schoolId: string): Promise<boolean>;
}

/**
 * Interface for Student domain service operations
 * Used by other modules to interact with the Students domain
 */
export interface IStudentsService {
  /**
   * Find a student by ID within a specific school
   * @param id - Student UUID
   * @param schoolId - School UUID
   * @returns StudentDto or throws NotFoundException
   */
  findOne(id: string, schoolId: string): Promise<any>;

  /**
   * Find all students in a school
   * @param schoolId - School UUID
   * @returns Array of StudentDto
   */
  findAll(schoolId: string): Promise<any[]>;
}

/**
 * Interface for Teacher domain service operations
 * Used by other modules to interact with the Teachers domain
 */
export interface ITeachersService {
  /**
   * Find a teacher by ID within a specific school
   * @param id - Teacher UUID
   * @param schoolId - School UUID
   * @returns TeacherDto or throws NotFoundException
   */
  findOne(id: string, schoolId: string): Promise<any>;
}

/**
 * Interface for School domain service operations
 * Used by other modules to interact with the Schools domain
 */
export interface ISchoolsService {
  /**
   * Find a school by ID
   * @param id - School UUID
   * @returns School entity or throws NotFoundException
   */
  findOne(id: string): Promise<any>;

  /**
   * Find a school by domain
   * @param domain - School domain name
   * @returns School entity or null
   */
  findByDomain(domain: string): Promise<any | null>;
}

/**
 * Interface for User domain service operations
 * Used by other modules to interact with the Users domain
 */
export interface IUsersService {
  /**
   * Find a user by ID within a specific school
   * @param id - User UUID
   * @param schoolId - School UUID
   * @returns User entity or throws NotFoundException
   */
  findOneEntity(id: string, schoolId: string): Promise<any>;

  /**
   * Find a user by username (email)
   * @param username - User email
   * @returns User entity or null
   */
  findOneByUsername(username: string): Promise<any | null>;
}
