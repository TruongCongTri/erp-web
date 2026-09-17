

export type AccountStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
export type AuthProvider = 'LOCAL' | 'GOOGLE' ;
export type OtpChannel = 'EMAIL' | 'SMS' | 'ZALO';
// export type UserRole = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';

export interface UserProfile {
  userId: string;
  slug: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  phone: string | null;
  totalStudents: number;
  averageRating: number;
  totalCourses: number;
}

export interface AuthUser {
  id: string;
  email: string;
  accountStatus: AccountStatus;
  phone: string | null;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  authProvider: AuthProvider;
  isActive: boolean;
  roleId: string;
  profile: UserProfile | null;
  createdAt: string;
}
