import type { UserResponse } from "./user";

export type LoginRequest = {
    email: string;
    password: string;
};

export type GoogleLoginRequest = {
    idToken: string;
};

export type ForgotPasswordRequest = {
    email: string;
};

export type ResetPasswordRequest = {
    email: string;
    otp: string;
    newPassword: string;
};

export type LoginResponse = {
    accessToken: string;
    refreshToken: string;
    authenticated: boolean;
    user: UserResponse;
};
