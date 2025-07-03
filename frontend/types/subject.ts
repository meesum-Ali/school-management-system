import { Class } from './class' // For classes array in Subject interface

// Corresponds to backend/src/subjects/dto/subject.dto.ts
export interface Subject {
  id: string
  name: string
  code?: string | null
  description?: string | null
  classes?: Class[] // Array of Class DTOs/interfaces
  createdAt: string
  updatedAt: string
}

// Corresponds to backend/src/subjects/dto/create-subject.dto.ts
export interface CreateSubjectDto {
  name: string
  code?: string
  description?: string
}

// Corresponds to backend/src/subjects/dto/update-subject.dto.ts
export interface UpdateSubjectDto {
  name?: string
  code?: string | null
  description?: string | null
}
