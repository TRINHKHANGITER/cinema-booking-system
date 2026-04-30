import api from "../lib/axios";
import type { ApiResponse } from "../types/api";
import type {
    ForgotPasswordRequest,
    GoogleLoginRequest,
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    ResendVerifyEmailRequest,
    ResetPasswordRequest,
    VerifyEmailRequest,
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
    register: async (request: RegisterRequest) => {
        const res = await api.post<ApiResponse<null>>("/auth/register", request);
        return res.data;
    },
    verifyEmail: async (request: VerifyEmailRequest) => {
        const res = await api.post<ApiResponse<null>>("/auth/verify-email", request);
        return res.data;
    },
    resendVerifyEmail: async (request: ResendVerifyEmailRequest) => {
        const res = await api.post<ApiResponse<null>>("/auth/resend-verify-email", request);
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
