/**
 * Base URL for the Digital Twin API.
 * Uses environment variable in production, defaults to local dev server.
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export const API_ENDPOINTS = {
  // ==========================================
  // 1. AUTHENTICATION MODULE
  // ==========================================
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
    SEND_VERIFY_EMAIL: "/auth/send-verify-email",
    RESEND_VERIFY_EMAIL: "auth/resend-verification",
    VERIFY_EMAIL: "/auth/verify-email",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    CHANGE_PASSWORD: "/auth/change-password",
    GOOGLE: "/auth/google"
  },
  // ==========================================
  // 2. USER MANAGEMENT MODULE
  // ==========================================
  USERS: {
    ALL: "/users",
    ME: "/auth/me",
    APPLICANTS: "/users/applicants", // Fetches PENDING users

    // Dynamic Routes
    DETAIL: (id: string) => `/users/${id}`,
    STATUS: (id: string) => `/users/${id}/status`, // Approve/Reject/Suspend
    ROLE: (id: string) => `/users/${id}/role`, // Promote/Demote

    AVATAR: "/users/me/avatar", // Upload Avatar
    PASSWORD: "/users/me/password", // Change Password
    SESSIONS: "/users/me/sessions", // List all sessions
    SESSION_DETAIL: (sessionId: string) => `/users/me/sessions/${sessionId}`, // Delete a session
  },
} as const;
