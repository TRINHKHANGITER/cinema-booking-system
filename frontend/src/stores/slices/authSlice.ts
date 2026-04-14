import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { authService } from "../../services/auth.service";
import type { ApiResponse } from "../../types/api";
import type { LoginRequest, LoginResponse } from "../../types/auth";
import type { UserResponse } from "../../types/user";
import {
    baseAsyncInitialState,
    mapUnknownError,
    rejectIfNotSuccess,
    type ApiErrorPayload,
} from "./sliceUtils";

const LS_ACCESS = import.meta.env.LOCALSTORAGE_ACCESS_TOKEN_KEY;
const LS_REFRESH = import.meta.env.LOCALSTORAGE_REFRESH_TOKEN_KEY;
const LS_USER = import.meta.env.LOCALSTORAGE_USER_KEY;

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
            .addCase(loginThunk.fulfilled, (state, action: PayloadAction<ApiResponse<LoginResponse>>) => {
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
            })
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
export default authSlice.reducer;
