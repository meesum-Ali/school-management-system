import { Subject } from './subject'; // For subjects array in Class interface
import { User } from './user'; // For homeroomTeacher (though ID only for now)

// Corresponds to backend/src/classes/dto/class.dto.ts
export interface Class {
  id: string;
  name: string;
  level: string;
  homeroomTeacherId?: string | null;
  // homeroomTeacher?: Partial<User>; // For future when we fetch teacher details
  subjects?: Subject[]; // Array of Subject DTOs/interfaces
  createdAt: string;
  updatedAt: string;
}

// Corresponds to backend/src/classes/dto/create-class.dto.ts
export interface CreateClassDto {
  name: string;
  level: string;
  homeroomTeacherId?: string; // Optional UUID string
}

// Corresponds to backend/src/classes/dto/update-class.dto.ts
export interface UpdateClassDto {
  name?: string;
  level?: string;
  homeroomTeacherId?: string | null; // Optional UUID string, can be null to clear
}
