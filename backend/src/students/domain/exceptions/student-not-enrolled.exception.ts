/**
 * Domain Exception: Student Not Enrolled
 * Thrown when attempting operations on non-enrolled student
 */
export class StudentNotEnrolledException extends Error {
  constructor(studentId: string) {
    super(`Student ${studentId} is not enrolled in any class`);
    this.name = 'StudentNotEnrolledException';
    Object.setPrototypeOf(this, StudentNotEnrolledException.prototype);
  }
}
