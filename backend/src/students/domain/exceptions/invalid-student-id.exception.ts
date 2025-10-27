/**
 * Domain Exception: Invalid Student ID
 * Thrown when student ID format is invalid
 */
export class InvalidStudentIdException extends Error {
  constructor(id: string, reason?: string) {
    const message = reason
      ? `Invalid student ID "${id}": ${reason}`
      : `Invalid student ID: "${id}"`;
    super(message);
    this.name = 'InvalidStudentIdException';
    Object.setPrototypeOf(this, InvalidStudentIdException.prototype);
  }
}
