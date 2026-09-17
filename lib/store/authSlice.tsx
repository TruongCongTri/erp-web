import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthUser } from "@/types/modelsver2";

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isInitialized: boolean; // KHÔI PHỤC: Để biết hệ thống đã check phiên đăng nhập lần đầu chưa
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isInitialized: false, // Ban đầu là false
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user?: Partial<AuthUser> | null }>,
    ) => {
      const incomingUser = action.payload.user;

      if (incomingUser) {
        if (state.user) {
          // THUẬT TOÁN MERGE DỮ LIỆU AN TOÀN:
          // Nếu API refresh token chỉ trả về user cơ bản (id, email...)
          // thì giữ nguyên role, permissions và profile cũ từ state
          state.user = {
            ...state.user,
            ...incomingUser,
            role: incomingUser.role ?? state.user.role,
            permissions: incomingUser.permissions ?? state.user.permissions,
            profile: incomingUser.profile ?? state.user.profile,
          };
        } else {
          state.user = incomingUser as AuthUser;
        }
        state.isAuthenticated = true;
      } else if (incomingUser === null) {
        state.user = null;
        state.isAuthenticated = false;
      }

      state.isInitialized = true;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isInitialized = true; // KHI API BÁO LỖI (401) -> Đánh dấu đã xong (Là khách)
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
