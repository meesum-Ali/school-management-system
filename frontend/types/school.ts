// Corresponds to backend/src/schools/entities/school.entity.ts
// and backend/src/schools/dto/school.dto.ts (if one exists, otherwise based on entity)

export interface School {
  id: string;
  name: string;
  domain?: string | null;
  address?: string | null;
  adminUserId?: string | null; // UUID of the first admin user for this school
  // users?: User[]; // Assuming User type is defined elsewhere
  createdAt: string; // Dates are typically strings over network
  updatedAt: string;
}

// For creating a school (if frontend needs to do this, typically SUPER_ADMIN only)
export interface CreateSchoolDto {
  name: string;
  domain?: string;
  address?: string;
  adminUserId?: string;
}

// For updating a school
export interface UpdateSchoolDto {
  name?: string;
  domain?: string;
  address?: string;
  adminUserId?: string;
}
