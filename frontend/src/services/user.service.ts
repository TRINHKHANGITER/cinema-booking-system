import api from "../lib/axios";
import type { ApiResponse } from "../types/api";
import type { UserCreationRequest, UserResponse } from "../types/user";

export const userService = {
    createUser: async (request: UserCreationRequest) => {
        const res = await api.post<ApiResponse<UserResponse>>("/user", request);
        return res.data;
    },

    getUserById: async (userId: number) => {
        const res = await api.get<ApiResponse<UserResponse>>(`/user/${userId}`);
        return res.data;
    },

    getUserByEmail: async (email: string) => {
        const res = await api.get<ApiResponse<UserResponse>>(`/user/email/${encodeURIComponent(email)}`);
        return res.data;
    },
};
