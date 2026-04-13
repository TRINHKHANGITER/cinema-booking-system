import type { UserResponse } from "./user";

export type LoginRequest = {
    emailOrUsername: string;
    password: string;
};

export type LoginResponse = {
    accessToken: string;
    refreshToken: string;
    authenticated: boolean;
    user: UserResponse;
};
