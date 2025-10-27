import { InvalidEmailException } from '../exceptions/invalid-email.exception';

/**
 * Email Value Object
 *
 * Represents an email address with validation and business rules.
 * Immutable and self-validating.
 *
 * Business Rules:
 * - Must be a valid email format
 * - Normalized to lowercase
 * - No leading/trailing whitespace
 * - Must contain @ symbol
 * - Must have local part and domain
 */
export class Email {
  private readonly value: string;

  private constructor(email: string) {
    this.value = email.toLowerCase().trim();
    Object.freeze(this);
  }

  /**
   * Factory method to create Email value object
   * @param email - Email string to validate and create
   * @returns Email value object
   * @throws InvalidEmailException if email is invalid
   */
  static create(email: string): Email {
    const trimmed = email.trim();

    // Business Rule: Email cannot be empty
    if (!trimmed) {
      throw new InvalidEmailException(email, 'Email cannot be empty');
    }

    // Business Rule: Must contain @
    if (!trimmed.includes('@')) {
      throw new InvalidEmailException(email, 'Email must contain @ symbol');
    }

    const [localPart, domain] = trimmed.split('@');

    // Business Rule: Must have local part (before @)
    if (!localPart) {
      throw new InvalidEmailException(
        email,
        'Email must have a local part before @',
      );
    }

    // Business Rule: Must have domain (after @)
    if (!domain) {
      throw new InvalidEmailException(
        email,
        'Email must have a domain after @',
      );
    }

    // Business Rule: Must match email format regex
    if (!this.isValidFormat(trimmed)) {
      throw new InvalidEmailException(email, 'Email format is invalid');
    }

    return new Email(trimmed);
  }

  /**
   * Validates email format using regex
   * @param email - Email string to validate
   * @returns true if valid format, false otherwise
   */
  private static isValidFormat(email: string): boolean {
    // RFC 5322 simplified regex for email validation
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    // Additional validation: no consecutive dots
    if (email.includes('..')) {
      return false;
    }

    return emailRegex.test(email);
  }

  /**
   * Get the email value
   * @returns Email string (normalized)
   */
  getValue(): string {
    return this.value;
  }

  /**
   * Get the domain part of the email
   * @returns Domain string (e.g., "example.com")
   */
  getDomain(): string {
    return this.value.split('@')[1];
  }

  /**
   * Get the local part of the email
   * @returns Local part string (e.g., "john.doe")
   */
  getLocalPart(): string {
    return this.value.split('@')[0];
  }

  /**
   * Check equality with another Email value object
   * @param other - Another Email instance
   * @returns true if emails are equal (case-insensitive)
   */
  equals(other: Email): boolean {
    if (!other) {
      return false;
    }
    return this.value === other.value;
  }

  /**
   * String representation
   * @returns Email string
   */
  toString(): string {
    return this.value;
  }
}
