import { isAxiosError } from "axios";
import type { ApiResponse } from "../../types/api";

export type ApiErrorPayload = {
    code: string;
    message: string;
};

export const rejectIfNotSuccess = <T>(response: ApiResponse<T>): ApiErrorPayload | null => {
    if (response.code === "SUCCESS") {
        return null;
    }

    return {
        code: response.code || "UNKNOWN_ERROR",
        message: response.message || "Request failed",
    };
};

export const mapUnknownError = (error: unknown): ApiErrorPayload => {
    if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        "message" in error
    ) {
        return {
            code: String((error as { code: unknown }).code ?? "UNKNOWN_ERROR"),
            message: String((error as { message: unknown }).message ?? "Unknown error"),
        };
    }

    if (isAxiosError(error)) {
        const data = error.response?.data as Partial<ApiResponse<unknown>> | undefined;
        return {
            code: String(data?.code ?? `HTTP_${error.response?.status ?? 500}`),
            message: String(data?.message ?? error.message ?? "Request failed"),
        };
    }

    if (error instanceof Error) {
        return {
            code: "UNKNOWN_ERROR",
            message: error.message,
        };
    }

    return {
        code: "UNKNOWN_ERROR",
        message: "Unknown error",
    };
};

export type BaseAsyncState = {
    loading: boolean;
    code: string | null;
    message: string | null;
};

export const baseAsyncInitialState: BaseAsyncState = {
    loading: false,
    code: null,
    message: null,
};
