// src/types/user.ts

export interface User {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  mobileNo?: string;
  avatar?: string;
  role: number;
  roleIds: string;
  roleName: string;
  franchiseId?: number;
  admissionId?: number;
  isActive: boolean;
  status: "All" | "Active" | "InActive"; // Add this property
  createdAt?: string;
  updatedAt?: string;
}

// Request DTOs for API calls
export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  mobileNo: string;
  password?: string;
  isActive: boolean;
  status: "All" | "Active" | "InActive";
  role?: number;
  roleIds?: string;
}

export interface UpdateUserRequest extends CreateUserRequest {
  id: number;
}

// Password reset types
export interface ResetPasswordRequest {
  email: string;
  newPassword: string;
  hash: string;
  salt: string;
  otp: number;
}

// Response types
export interface PaginatedUsersResponse {
  output: {
    result: User[];
    rowCount: number;
  };
}