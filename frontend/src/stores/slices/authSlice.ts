/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { authService } from "../../services/auth.service";
import { userService } from "../../services/user.service";
import type { ApiResponse } from "../../types/api";
import type { LoginRequest, LoginResponse } from "../../types/auth";
import type { UserCreationRequest, UserResponse } from "../../types/user";
import {
    baseAsyncInitialState,
    mapUnknownError,
    rejectIfNotSuccess,
    type ApiErrorPayload,
} from "./sliceUtils";

const LS_ACCESS =
    import.meta.env.VITE_LOCALSTORAGE_ACCESS_TOKEN_KEY ??
    import.meta.env.LOCALSTORAGE_ACCESS_TOKEN_KEY ??
    "CINEMA_ACCESS_TOKEN_KEY";
const LS_REFRESH =
    import.meta.env.VITE_LOCALSTORAGE_REFRESH_TOKEN_KEY ??
    import.meta.env.LOCALSTORAGE_REFRESH_TOKEN_KEY ??
    "CINEMA_REFRESH_TOKEN_KEY";
const LS_USER =
    import.meta.env.VITE_LOCALSTORAGE_USER_KEY ??
    import.meta.env.LOCALSTORAGE_USER_KEY ??
    "CINEMA_USER_KEY";

const safeReadUser = (): UserResponse | null => {
    const raw = localStorage.getItem(LS_USER);
    if (!raw) return null;

    try {
        return JSON.parse(raw) as UserResponse;
    } catch {
        return null;
    }
};

const clearStorage = () => {
    localStorage.removeItem(LS_ACCESS);
    localStorage.removeItem(LS_REFRESH);
    localStorage.removeItem(LS_USER);
};

export type AuthState = {
    loading: boolean;
    code: string | null;
    message: string | null;
    accessToken: string | null;
    refreshToken: string | null;
    user: UserResponse | null;
    isAuthenticated: boolean;
};

const initialState: AuthState = {
    ...baseAsyncInitialState,
    accessToken: localStorage.getItem(LS_ACCESS),
    refreshToken: localStorage.getItem(LS_REFRESH),
    user: safeReadUser(),
    isAuthenticated: Boolean(localStorage.getItem(LS_ACCESS)),
};

export const loginThunk = createAsyncThunk<
    ApiResponse<LoginResponse>,
    LoginRequest,
    { rejectValue: ApiErrorPayload }
>("auth/login", async (request, { rejectWithValue }) => {
    try {
        const response = await authService.login(request);
        const apiError = rejectIfNotSuccess(response);

        if (apiError) {
            return rejectWithValue(apiError);
        }

        return response;
    } catch (error) {
        return rejectWithValue(mapUnknownError(error));
    }
});

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        signOut(state) {
            state.accessToken = null;
            state.refreshToken = null;
            state.user = null;
            state.isAuthenticated = false;
            state.code = "SUCCESS";
            state.message = "Signed out";
            clearStorage();
        },
        restoreAuthFromStorage(state) {
            state.accessToken = localStorage.getItem(LS_ACCESS);
            state.refreshToken = localStorage.getItem(LS_REFRESH);
            state.user = safeReadUser();
            state.isAuthenticated = Boolean(state.accessToken);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginThunk.pending, (state) => {
                state.loading = true;
                state.code = null;
                state.message = null;
            })
            .addCase(
                loginThunk.fulfilled,
                (state, action: PayloadAction<ApiResponse<LoginResponse>>) => {
                    state.loading = false;
                    state.code = action.payload.code;
                    state.message = action.payload.message ?? null;

                    const result = action.payload.result;
                    state.accessToken = result?.accessToken ?? null;
                    state.refreshToken = result?.refreshToken ?? null;
                    state.user = result?.user ?? null;
                    state.isAuthenticated = Boolean(result?.accessToken);

                    if (result?.accessToken) {
                        localStorage.setItem(LS_ACCESS, result.accessToken);
                    }
                    if (result?.refreshToken) {
                        localStorage.setItem(LS_REFRESH, result.refreshToken);
                    }
                    if (result?.user) {
                        localStorage.setItem(LS_USER, JSON.stringify(result.user));
                    }
                }
            )
            .addCase(loginThunk.rejected, (state, action) => {
                state.loading = false;
                state.code = action.payload?.code ?? "UNKNOWN_ERROR";
                state.message = action.payload?.message ?? action.error.message ?? "Request failed";
                state.isAuthenticated = false;
                state.accessToken = null;
                state.refreshToken = null;
                state.user = null;
                clearStorage();
            });
    },
});

export const { signOut, restoreAuthFromStorage } = authSlice.actions;

type AuthStoreCompat = AuthState & {
    signIn: (email: string, password: string) => Promise<ApiResponse<LoginResponse>>;
    signOut: () => Promise<void>;
    signUp: (
        fullName: string,
        password: string,
        email: string,
        phoneNumber: string,
        dateOfBirth?: string
    ) => Promise<void>;
    refresh: () => Promise<void>;
    fetchMe: () => Promise<void>;
};

export const useAuthStore = <T = AuthStoreCompat>(selector?: (state: AuthStoreCompat) => T): T => {
    const dispatch = useDispatch<any>();
    const auth = useSelector((state: { auth: AuthState }) => state.auth);

    const compat: AuthStoreCompat = {
        ...auth,
        signIn: async (email: string, password: string) => {
            const action = await dispatch(
                loginThunk({
                    email,
                    password,
                })
            );  

            if (loginThunk.fulfilled.match(action)) {
                return action.payload;
            }

            const errorMessage =
                action.payload?.message ?? action.error?.message ?? "Dang nhap that bai";
            throw new Error(errorMessage);
        },
        signOut: async () => {
            dispatch(signOut());
        },
        signUp: async (
            fullName: string,
            password: string,
            email: string,
            phoneNumber: string,
            dateOfBirth?: string
        ) => {
            const username = email.split("@")[0] || `user${Date.now()}`;
            const payload: UserCreationRequest = {
                fullName,
                phoneNumber,
                username,
                email,
                password,
                dateOfBirth: dateOfBirth || null,
                sex: null,
            };

            const response = await userService.createUser(payload);
            if (response.code === "SUCCESS") {
                await dispatch(
                    loginThunk({
                        emailOrUsername: email,
                        password,
                    })
                );
            }
        },
        refresh: async () => {
            dispatch(restoreAuthFromStorage());
        },
        fetchMe: async () => {
            dispatch(restoreAuthFromStorage());
        },
    };

    if (!selector) {
        return compat as T;
    }

    return selector(compat);
};

export default authSlice.reducer;
