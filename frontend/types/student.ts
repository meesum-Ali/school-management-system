export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // Representing date as string from API
  email: string;
  studentId: string;
}

export interface CreateStudentDto {
  firstName: string;
  lastName:string;
  dateOfBirth: string;
  email: string;
  studentId: string;
}

export interface UpdateStudentDto {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  email?: string;
  studentId?: string;
}
