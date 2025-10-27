/**
 * Domain Exception: Invalid Student Data
 * Thrown when student data violates business rules
 */
export class InvalidStudentException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidStudentException';
    Object.setPrototypeOf(this, InvalidStudentException.prototype);
  }
}
