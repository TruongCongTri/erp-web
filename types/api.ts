import {
  AuthUser,
  // UserRole,
  OtpChannel,
} from "./models";

// ==========================================
// 1. GENERIC ENVELOPES (API RESPONSE BINDING)
// ==========================================
export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface BaseMeta {
  success: boolean;
  message: string;
}

export interface SuccessMeta extends BaseMeta {
  success: true;
  pagination?: PaginationMeta;
}

export interface ErrorMeta extends BaseMeta {
  success: false;
  error_code?: string | number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors?: string | string[] | Record<string, unknown> | any[];
}

export interface ApiResponse<T = undefined> {
  data?: T;
  meta: SuccessMeta;
}

// Aliases for Redux Query usage
export type SingleResponse<T> = ApiResponse<T>;
export type ListResponse<T> = ApiResponse<T[]>;
export type PaginatedResponse<T> = ApiResponse<T[]>;
export type MetaResponse = ApiResponse<undefined>;
export interface ApiErrorResponse {
  meta: ErrorMeta;
}

// ==========================================
// 2. AUTH & USER REQUESTS
// ==========================================
export interface GetMeResponse {
  data: AuthUser;
  meta: SuccessMeta;
}
export interface LoginResponse {
  data: { user: AuthUser; accessToken: string };
  meta: SuccessMeta;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}
export interface LoginRequest {
  email: string;
  password: string;
  deviceId?: string;
  rememberMe?: boolean;
}
export interface SendVerifyEmailRequest {
  identifier: string;
  channel: OtpChannel;
}
export interface VerifyEmailRequest {
  identifier: string;
  code: string;
  channel: OtpChannel;
}
export interface ForgotPasswordRequest {
  email: string;
}
export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
export interface UpdateProfileRequest {
  fullName?: string;
  bio?: string;
  phone?: string;
}
export interface RequestEmailChangeRequest {
  newEmail: string;
}
export interface DeleteAccountRequest {
  passwordConfirm: string;
}

// ==========================================
// 5. PUBLIC REQUESTS
// ==========================================
export interface GetCoursesParams {
  page?: number;
  limit?: number;
  search?: string;
  categorySlug?: string;
  instructorSlug?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  timeframe?: string;
}
export interface GetCategoriesParams {
  includeCourses?: "true" | "false";
  sortBy?: string;
}
export interface GetCourseReviewsParams {
  page?: number;
  limit?: number;
  rating?: number;
}
export interface GetInstructorsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
}

// ==========================================
// 7. ADMIN REQUESTS
// ==========================================

// -> System (Admin System)
export interface AdminCreateForbiddenWordRequest {
  word: string;
}
export interface AdminCreateRoleRequest {
  name: string;
  description?: string;
}
export interface AdminUpdateRolePermissionsRequest {
  permissionIds: string[];
}

// -> Users (Admin User)
export interface AdminQueryUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: "ACTIVE" | "BANNED" | "PENDING";
  sortBy?: "createdAt" | "fullName" | "email";
  sortOrder?: "asc" | "desc";
}
export interface AdminUpdateRoleRequest {
  roleId: string;
}
export interface AdminUpdateStatusRequest {
  isActive: boolean;
  reason?: string;
}
export interface AdminUpdatePermissionsRequest {
  permissionIds: string[];
}
export interface AdminManualEnrollmentRequest {
  courseId: string;
  note?: string;
}

