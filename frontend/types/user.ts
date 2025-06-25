// Corresponds to backend UserRole enum
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SCHOOL_ADMIN = 'SCHOOL_ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  PARENT = 'PARENT',
}

// Corresponds to backend/src/users/dto/user.dto.ts (UserDto)
// and AuthContext's AuthUser
export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  roles: UserRole[];
  createdAt: string; // Dates are typically strings over network
  updatedAt: string;
  schoolId?: string | null; // Added schoolId
}

// Corresponds to backend/src/users/dto/create-user.dto.ts
export interface CreateUserDto {
  username: string;
  email: string;
  password?: string; // Password is required for create, but might be omitted if set by admin without knowing it
  firstName?: string;
  lastName?: string;
  roles?: UserRole[];
  isActive?: boolean;
}

// Corresponds to backend/src/users/dto/update-user.dto.ts
export interface UpdateUserDto {
  username?: string;
  email?: string;
  password?: string; // Optional for updates
  firstName?: string;
  lastName?: string;
  roles?: UserRole[];
  isActive?: boolean;
}
