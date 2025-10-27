import { randomUUID } from 'crypto';
import { InvalidStudentIdException } from '../exceptions/invalid-student-id.exception';

/**
 * StudentId Value Object
 *
 * Represents a unique student identifier.
 * Immutable and self-validating.
 *
 * Business Rules:
 * - Must be at least 3 characters
 * - Must not exceed 100 characters
 * - Cannot be empty or whitespace
 * - Supports both UUID and custom formats
 */
export class StudentId {
  private readonly value: string;
  private static readonly MIN_LENGTH = 3;
  private static readonly MAX_LENGTH = 100;

  private constructor(id: string) {
    this.value = id.trim();
    Object.freeze(this);
  }

  /**
   * Factory method to create StudentId value object
   * @param id - Student ID string to validate and create
   * @returns StudentId value object
   * @throws InvalidStudentIdException if ID is invalid
   */
  static create(id: string): StudentId {
    const trimmed = id.trim();

    // Business Rule: ID cannot be empty
    if (!trimmed) {
      throw new InvalidStudentIdException(id, 'Student ID cannot be empty');
    }

    // Business Rule: Minimum length
    if (trimmed.length < this.MIN_LENGTH) {
      throw new InvalidStudentIdException(
        id,
        `Student ID must be at least ${this.MIN_LENGTH} characters long`,
      );
    }

    // Business Rule: Maximum length
    if (trimmed.length > this.MAX_LENGTH) {
      throw new InvalidStudentIdException(
        id,
        `Student ID must not exceed ${this.MAX_LENGTH} characters`,
      );
    }

    return new StudentId(trimmed);
  }

  /**
   * Generate a new UUID-based student ID
   * @returns New StudentId with UUID value
   */
  static generate(): StudentId {
    const uuid = randomUUID();
    return new StudentId(uuid);
  }

  /**
   * Get the student ID value
   * @returns Student ID string
   */
  getValue(): string {
    return this.value;
  }

  /**
   * Check if ID is in UUID format
   * @returns true if UUID format, false otherwise
   */
  isUUID(): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(this.value);
  }

  /**
   * Check equality with another StudentId value object
   * @param other - Another StudentId instance
   * @returns true if IDs are equal
   */
  equals(other: StudentId): boolean {
    if (!other) {
      return false;
    }
    return this.value === other.value;
  }

  /**
   * String representation
   * @returns Student ID string
   */
  toString(): string {
    return this.value;
  }
}
