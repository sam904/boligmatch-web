// src/services/user.service.ts
import { http } from './http.service';
import type { 
  User, 
  CreateUserRequest, 
  UpdateUserRequest,
  PaginatedUsersResponse
} from '../types/user';

// Update OTPResponse to match the actual API response structure
export interface OTPResponse {
  message: {
    errorMessage: string | null;
    fileContent: string | null;
    fileName: string | null;
    contentType: string | null;
    failureReason: string | null;
    isSuccess: boolean;
    output: string;
  };
}

// Update OTP verification response - it's a direct object, not nested in message
export interface OTPVerificationResponse {
  errorMessage: string | null;
  fileContent: string | null;
  fileName: string | null;
  contentType: string | null;
  failureReason: string | null;
  isSuccess: boolean;
  output: boolean; // This is boolean, not string
}

export interface EmailMobileAvailabilityResponse {
  errorMessage: string | null;
  fileContent: string | null;
  fileName: string | null;
  contentType: string | null;
  failureReason: string | null;
  isSuccess: boolean;
  output: string | null;
}

// Update the User type locally if needed, or import from types
export interface UserWithStatus extends User {
  status: "All" | "Active" | "InActive";
}

export const userService = {
  getById: (id: number) => http.get<User>(`/User/getUserById/${id}`),
  
  getAll: (includeInActive = false) =>
    http.get<User[]>(`/User/getAllUsers?includeInActive=${includeInActive}`),
  
  add: (body: CreateUserRequest) => http.post<User>(`/User/addUser`, body),
  
  update: (body: UpdateUserRequest) => http.put<User>(`/User/updateUser`, body),
  
  remove: (id: number) => http.delete<void>(`/User/DeleteUser/${id}`),
  
  getPaginated: (query: {
    page: number;
    pageSize: number;
    searchTerm?: string;
    status?: "All" | "Active" | "InActive";
  }) => http.post<PaginatedUsersResponse>(`/User/getPaginatedUsers`, query),

  resetUserPassword: (data: { 
    email: string; 
    newPassword: string;
  }) => http.post<boolean>(`/Password/resetPassword`, {
    email: data.email,
    newPassword: data.newPassword,
    hash: "",
    salt: "",
    otp: 0,
  }),

  // Use GET request with email as path parameter
  generateAndSendOTPToEmail: (email: string) => 
    http.get<OTPResponse>(`/Password/generateAndSendOTPToEmail/${encodeURIComponent(email)}`),

  // FIXED: Send as query parameters instead of request body
  verifyOTP: (data: { email: string; otp: string }) =>
    http.post<OTPVerificationResponse>(
      `/User/emailOTPVerification?email=${encodeURIComponent(data.email)}&otp=${data.otp}`,
      {} // Empty body since parameters are in query string
    ),

     checkEmailOrMobileAvailability: (emailOrMobile: string) => 
    http.get<EmailMobileAvailabilityResponse>(
      `/User/emailOrMobileVerificationAvailability?emailOrMobile=${encodeURIComponent(emailOrMobile)}`
    ),


};