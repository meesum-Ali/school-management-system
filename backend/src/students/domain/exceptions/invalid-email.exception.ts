/**
 * Domain Exception: Invalid Email
 * Thrown when email format is invalid or fails business rules
 */
export class InvalidEmailException extends Error {
  constructor(email: string, reason?: string) {
    const message = reason
      ? `Invalid email "${email}": ${reason}`
      : `Invalid email format: "${email}"`;
    super(message);
    this.name = 'InvalidEmailException';
    Object.setPrototypeOf(this, InvalidEmailException.prototype);
  }
}
