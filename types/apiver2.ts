import type {
  AuthUser,
  Department,
  Employee,
  Role,
  UpcomingEvent,
} from "./modelsver2";

// ==========================================
// GENERIC API RESPONSES (Wrappers)
// ==========================================

export interface SingleResponse<T> {
  data: T;
  message?: string;
}

export interface ListResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface MetaResponse {
  success: boolean;
  message: string;
}

// ==========================================
// AUTHENTICATION REQUESTS & RESPONSES
// ==========================================

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean; // Matches your onQueryStarted logic
}

export interface LoginResponse {
  data: {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
  };
  meta: MetaResponse;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface ForgotPasswordRequest {
  email: string;
  channel: "email" | "zalo";
}

export interface ResetPasswordRequest {
  email: string;
  otp: string; // Usually passed via URL query
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  name?: string;
  avatarUrl?: string;
}

// Response alias matching authApiSlice.ts
export interface GetMeResponse {
  data: AuthUser;
  meta?: any;
}

// ==========================================
// DASHBOARD & HR DATA
// ==========================================

export interface TodayStats {
  total: number;
  active: number;
  onLeave: number;
  pendingRequests: number;
}
