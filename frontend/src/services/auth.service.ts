import api from "../lib/axios";
import type { ApiResponse } from "../types/api";
import type { LoginRequest, LoginResponse } from "../types/auth";

export const authService = {
    login: async (request: LoginRequest) => {
        const res = await api.post<ApiResponse<LoginResponse>>("/auth/login", request);
        return res.data;
    },
};
