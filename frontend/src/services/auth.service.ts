import axiosClient from "../lib/axios";
import type { LoginRequest, LoginResponse } from "../types/auth";
import type { ApiResponse } from "../types/api";
import type { User } from "../types/user";

export const authService = {
    login: async (request: LoginRequest) => {
        const res = await axiosClient.post<ApiResponse<LoginResponse>>("/auth/login", request);
        return res.data; 
    },


    me: async () => {
        const res = await axiosClient.post<ApiResponse<User>>("/auth/me");
        return res.data; 
    },
};
