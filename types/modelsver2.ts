export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  LOCKED = "LOCKED",
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

// 1. Base Auditable Entity
export interface AuditableEntity {
  createdAt: string; // Dates from JSON APIs always arrive as ISO strings
  updatedAt: string;
  createdBy?: string;
  createdByName?: string;
  updatedBy?: string;
  updatedByName?: string;
  deletedAt?: string | null;
  deletedBy?: string | null;
  deletedByName?: string | null;
}

export interface SystemResource extends AuditableEntity {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  isLive: boolean;
  // Permissions might be omitted when fetching a simple list, but exist when relations are loaded
  permissions?: Permission[];
}

// 2. Role and Permission (Minimal representations based on references)
export type PermissionAction =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "approve"
  | "manage"
  | "process"
  | "audit";
export type PermissionScope = "own" | "dept" | "any";
export interface Permission extends AuditableEntity {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  action: PermissionAction;
  scope: PermissionScope;
  isDefault: boolean;
  isLive: boolean;
  resource: SystemResource; // Because eager: true in NestJS
}

export interface Role extends AuditableEntity {
  id: string;
  slug: string;
  name: string;
  isDefault: boolean;
  isLive: boolean;
  usersCount: number; // Count of users assigned to this role
  permissionsCount: number; // Count of permissions assigned to this role
  permissions: Permission[]; // Ensure the backend eager loads or joins this
}

export interface UserRole {
  id: string;
  slug: string;
  name: string;
  isDefault: boolean;
  isLive: boolean;
  // Note: We don't necessarily need to type the full nested permissions array
  // here because we use the flat `permissions` array below for UI logic.
}

// 3. User Avatar
export interface UserAvatar extends AuditableEntity {
  id: string;
  url: string;
  isPrimary: boolean;
  // Add other avatar fields based on your BE
}

// 4. Citizen Identity Card
export interface CitizenIdentityCard extends AuditableEntity {
  id: string;
  cccdNumber: string;
  fullName: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: Gender;
  nationality: string;
  ethnicity?: string;
  religion?: string;
  placeOfOrigin: string;
  placeOfResidence: string;
  temporaryAddress?: string;
  personalIdentification?: string;
  dateOfIssue: string; // YYYY-MM-DD
  dateOfExpiry: string; // YYYY-MM-DD
  placeOfIssue: string;
  rawQrData?: Record<string, any>;
}

// 5. Employee Profile
export interface EmployeeProfile extends AuditableEntity {
  id: string;
  employeeCode: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: string;
  taxCode?: string;
  socialInsuranceNumber?: string;
  identityCard?: CitizenIdentityCard; // Optional because it might not be joined in the query
  phoneNumber: string;
  permanentAddress: string;
  temporaryAddress?: string;
  joinDate: string; // YYYY-MM-DD
  jobTitle: string;
  department?: string;
  location?: string;
  contractType?: string;
}

export interface AuthUser extends AuditableEntity {
  id: string;
  email: string;
  // passwordHash is omitted because it has { select: false } in TypeORM
  fullName: string;
  avatarUrl?: string;
  status: UserStatus;

  // Relations: These are optional (?) because the backend might not
  // always JOIN these tables in every query (e.g., /auth/me vs /users/:id)
  role?: Role;
  bonusPermissions?: Permission[];
  permissions: string[];
  profile?: EmployeeProfile;
  avatars?: UserAvatar[];
}

export interface Department {
  id: string;
  name: string;
  managerId?: string;
  headcount: number;
}

export interface Employee {
  id: string;
  userId: string;
  departmentId: string;
  position: string;
  joinDate: string;
  isDeleted: boolean; // Used for the soft-delete mutation
}

export interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  type: "MEETING" | "HOLIDAY" | "TRAINING";
}

// Define the specific structure of the meta object
export interface ErrorMeta {
  success: boolean;
  status_code: number;
  message: string;
  error_code?: "PENDING_VERIFICATION" | "ACCOUNT_SUSPENDED" | string;
}

// Define the full error response payload
export interface ApiErrorResponse {
  meta?: ErrorMeta;
  data?: {
    userId?: string;
    email?: string;
    [key: string]: any;
  };
}

export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  total_page: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    success: boolean;
    status_code: number;
    message: string;
    pagination: PaginationMeta;
  };
}

export interface SingleResponse<T> {
  data: T;
  message: string;
}

export type GroupedPermissionsResponse = Record<string, Permission[]>;
