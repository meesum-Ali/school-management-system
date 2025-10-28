// Corresponds to backend/src/teachers/entities/teacher.entity.ts
export interface Teacher {
  id: string // UUID
  userId: string
  employeeId: string
  hireDate: string // ISO date string
  qualification?: string | null
  specialization?: string | null
  schoolId: string
  createdAt: string
  updatedAt: string
  // Joined from User entity
  user?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
}

// Corresponds to backend/src/teachers/dto/create-teacher.dto.ts
export interface CreateTeacherDto {
  userId: string // Must reference an existing user
  employeeId: string
  hireDate: string // ISO date string (YYYY-MM-DD)
  qualification?: string
  specialization?: string
}

// Corresponds to backend/src/teachers/dto/update-teacher.dto.ts
export interface UpdateTeacherDto {
  employeeId?: string
  hireDate?: string
  qualification?: string
  specialization?: string
}

// Extended type for display purposes
export interface TeacherDetails extends Teacher {
  fullName: string
  assignedClasses?: ClassAssignment[]
}

// For class assignment feature (Phase 3)
export interface ClassAssignment {
  classId: string
  className: string
  subjects: {
    subjectId: string
    subjectName: string
  }[]
}
