import api from "../lib/axios";
import type { ApiResponse } from "../types/api";
import type { User } from "../types/user";

type LoginResult = {
    accessToken: string;
    refreshToken: string;
    authenticated: boolean;
    user: User;
};

export const authService = {
    signUp: async (
        fullName: string,
        password: string,
        email: string,
        phone: string,
        dateOfBirth: string
    ) => {
        const username = email.split("@")[0];
        const res = await api.post<ApiResponse<User>>("/user", {
            fullName,
            phoneNumber: phone,
            username,
            dateOfBirth: dateOfBirth || null,
            sex: "other",
            email,
            password,
        });

        return res.data.result;
    },

    signIn: async (emailOrUsername: string, password: string) => {
        const res = await api.post<ApiResponse<LoginResult>>("/auth/login", {
            emailOrUsername,
            password,
        });

        return res.data.result;
    },

    signOut: async () => {
        return;
    },

    fetchMe: async () => {
        return null;
    },

    refresh: async () => {
        return null;
    },
};
