// src/types/user.ts

export interface User {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  email?: string;
  mobileNo?: string;
  avatar?: string;
  role: number;
  roleIds: string;
  roleName: string;
  franchiseId?: number;
  admissionId?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Request DTOs for API calls
export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  mobileNo: string;
  // Optional: required for self-signup, not required for admin edits
  password?: string;
  isActive: boolean;
  role?: number;
  roleIds?: string;
}

export interface UpdateUserRequest extends CreateUserRequest {
  id: number;
}


// Response types
export interface PaginatedUsersResponse {
  output: {
    result: User[];
    rowCount: number;
  };
}