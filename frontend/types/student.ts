// Corresponds to backend/src/students/dto/student.dto.ts
export interface Student {
  id: string // Changed to string for UUID
  firstName: string
  lastName: string
  dateOfBirth: string // Keep as string for form compatibility, backend handles Date
  email: string
  studentId: string
  createdAt: string // Dates are typically strings over network
  updatedAt: string
  classId?: string | null
  currentClassName?: string | null
}

// Corresponds to backend/src/students/dto/create-student.dto.ts
export interface CreateStudentDto {
  firstName: string
  lastName: string
  dateOfBirth: string // Expect string from date input
  email: string
  studentId: string
  classId?: string | null
}

// Corresponds to backend/src/students/dto/update-student.dto.ts
export interface UpdateStudentDto {
  firstName?: string
  lastName?: string
  dateOfBirth?: string // Expect string from date input
  email?: string
  studentId?: string
  classId?: string | null
}
