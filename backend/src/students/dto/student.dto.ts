export class StudentDto {
  id: string; // Changed from number to string for UUID
  firstName: string;
  lastName: string;
  dateOfBirth: Date; // Or string if you prefer to format it here
  email: string;
  studentId: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<StudentDto>) {
    Object.assign(this, partial);
  }
}
