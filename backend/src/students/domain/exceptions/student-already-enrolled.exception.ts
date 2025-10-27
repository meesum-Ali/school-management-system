/**
 * Domain Exception: Student Already Enrolled
 * Thrown when attempting to enroll a student who is already enrolled in a class
 */
export class StudentAlreadyEnrolledException extends Error {
  constructor(studentId: string, classId: string) {
    super(`Student ${studentId} is already enrolled in class ${classId}`);
    this.name = 'StudentAlreadyEnrolledException';
    Object.setPrototypeOf(this, StudentAlreadyEnrolledException.prototype);
  }
}
