/**
 * Domain Exception: Invalid Date of Birth
 * Thrown when date of birth fails business rules (age constraints, future dates, etc.)
 */
export class InvalidDateOfBirthException extends Error {
  constructor(date: string | Date, reason?: string) {
    const message = reason
      ? `Invalid date of birth "${date}": ${reason}`
      : `Invalid date of birth: "${date}"`;
    super(message);
    this.name = 'InvalidDateOfBirthException';
    Object.setPrototypeOf(this, InvalidDateOfBirthException.prototype);
  }
}
