import { InvalidDateOfBirthException } from '../exceptions/invalid-date-of-birth.exception';

/**
 * DateOfBirth Value Object
 *
 * Represents a date of birth with age-related business rules.
 * Immutable and self-validating.
 *
 * Business Rules:
 * - Cannot be in the future
 * - Cannot be more than 150 years ago
 * - Must be a valid date
 */
export class DateOfBirth {
  private readonly value: Date;
  private static readonly MAX_AGE = 150;
  private static readonly MINOR_AGE = 18;
  private static readonly SCHOOL_MIN_AGE = 5;
  private static readonly SCHOOL_MAX_AGE = 18;

  private constructor(date: Date) {
    this.value = new Date(date);
    Object.freeze(this);
  }

  /**
   * Factory method to create DateOfBirth value object
   * @param date - Date string or Date object
   * @returns DateOfBirth value object
   * @throws InvalidDateOfBirthException if date is invalid
   */
  static create(date: string | Date): DateOfBirth {
    // Parse date
    let parsedDate: Date;

    if (typeof date === 'string') {
      if (!date.trim()) {
        throw new InvalidDateOfBirthException(
          date,
          'Date of birth cannot be empty',
        );
      }
      parsedDate = new Date(date);
    } else {
      parsedDate = date;
    }

    // Business Rule: Must be a valid date
    if (isNaN(parsedDate.getTime())) {
      throw new InvalidDateOfBirthException(date, 'Invalid date format');
    }

    // Business Rule: Cannot be in the future
    const now = new Date();
    now.setHours(23, 59, 59, 999); // End of today
    if (parsedDate > now) {
      throw new InvalidDateOfBirthException(
        date,
        'Date of birth cannot be in the future',
      );
    }

    // Business Rule: Cannot be more than MAX_AGE years ago
    const maxAgeDate = new Date();
    maxAgeDate.setFullYear(maxAgeDate.getFullYear() - this.MAX_AGE);
    if (parsedDate < maxAgeDate) {
      throw new InvalidDateOfBirthException(
        date,
        `Date of birth cannot exceed maximum age of ${this.MAX_AGE} years`,
      );
    }

    return new DateOfBirth(parsedDate);
  }

  /**
   * Get the date value
   * @returns Date object
   */
  getValue(): Date {
    return new Date(this.value);
  }

  /**
   * Calculate current age in years
   * @returns Age in years
   */
  getAge(): number {
    const today = new Date();
    let age = today.getFullYear() - this.value.getFullYear();
    const monthDiff = today.getMonth() - this.value.getMonth();

    // Adjust age if birthday hasn't occurred this year
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < this.value.getDate())
    ) {
      age--;
    }

    return age;
  }

  /**
   * Check if person is a minor (under 18)
   * @returns true if minor, false otherwise
   */
  isMinor(): boolean {
    return this.getAge() < DateOfBirth.MINOR_AGE;
  }

  /**
   * Check if person is of typical school age (5-18)
   * @returns true if school age, false otherwise
   */
  isSchoolAge(): boolean {
    const age = this.getAge();
    return (
      age >= DateOfBirth.SCHOOL_MIN_AGE && age <= DateOfBirth.SCHOOL_MAX_AGE
    );
  }

  /**
   * Get ISO 8601 string representation
   * @returns ISO date string
   */
  toISOString(): string {
    return this.value.toISOString();
  }

  /**
   * Check equality with another DateOfBirth value object
   * @param other - Another DateOfBirth instance
   * @returns true if dates are equal
   */
  equals(other: DateOfBirth): boolean {
    if (!other) {
      return false;
    }
    return this.value.getTime() === other.value.getTime();
  }

  /**
   * String representation
   * @returns ISO date string
   */
  toString(): string {
    return this.toISOString();
  }
}
