import api from "../lib/axios";
import type { ApiResponse } from "../types/api";
import type { GoogleLoginRequest, LoginRequest, LoginResponse } from "../types/auth";

export const authService = {
    login: async (request: LoginRequest) => {
        const res = await api.post<ApiResponse<LoginResponse>>("/auth/login", request);
        return res.data;
    },
    googleLogin: async (request: GoogleLoginRequest) => {
        const res = await api.post<ApiResponse<LoginResponse>>("/auth/google", request);
        return res.data;
    },
};
