import api from "../lib/axios";
import type { ApiResponse } from "../types/api";
import type {
    ForgotPasswordRequest,
    GoogleLoginRequest,
    LoginRequest,
    LoginResponse,
    ResetPasswordRequest,
} from "../types/auth";

export const authService = {
    login: async (request: LoginRequest) => {
        const res = await api.post<ApiResponse<LoginResponse>>("/auth/login", request);
        return res.data;
    },
    googleLogin: async (request: GoogleLoginRequest) => {
        const res = await api.post<ApiResponse<LoginResponse>>("/auth/google", request);
        return res.data;
    },
    forgotPassword: async (request: ForgotPasswordRequest) => {
        const res = await api.post<ApiResponse<null>>("/auth/forgot-password", request);
        return res.data;
    },
    resetPassword: async (request: ResetPasswordRequest) => {
        const res = await api.post<ApiResponse<null>>("/auth/reset-password", request);
        return res.data;
    },
};
