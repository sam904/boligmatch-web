// src/types/user.ts

export interface User {
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
