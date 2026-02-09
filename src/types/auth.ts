// src/types/auth.ts

export interface LoginDto {
  userName: string;
  password: string;
}

export interface AuthUser {
  userId: number;
  firstName: string;
  lastName: string;
  email?: string;
  avatar?: string;
  role: number;
  roleIds: string;
  roleId: number;
  roleName: string;
  franchiseId?: number;
  partnerId?: number;
  mobileNo?: string;
  isActive?: boolean;
  status?: "Active" | "InActive";
}

export interface LoginResponse {
  failureReason: string | null;
  isSuccess: boolean;
  output: {
    firstName: string;
    userId: number;
    lastName: string;
    email: string;
    token: string;
    refreshToken: string;
    refreshTokenExpiryTime: string;
    avatar: string;
    franchiseId: number;
    role: number;
    roleIds: string;
    roleId: number;
    roleName: string;
    admissionId: number;
    mobileNo: string;
  };
}
