import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { cinemaService } from "../../services/cinema.service";
import type { ApiResponse, PagingDto } from "../../types/api";
import type {
    Cinema,
    CinemaCreationRequest,
    CinemaStatus,
    CinemaUpdateRequest,
} from "../../types/cinema";
import {
    baseAsyncInitialState,
    mapUnknownError,
    rejectIfNotSuccess,
    type ApiErrorPayload,
} from "./sliceUtils";

type GetCinemasParams = {
    provinceId?: number;
    isShowing?: boolean;
    status?: CinemaStatus;
};

type GetAllCinemasParams = {
    provinceId?: number;
    page?: number;
    size?: number;
    status?: CinemaStatus;
};

export type CinemaState = {
    loading: boolean;
    code: string | null;
    message: string | null;
    cinemas: Cinema[];
    currentCinema: Cinema | null;
    paging: PagingDto<Cinema> | null;
};

const initialState: CinemaState = {
    ...baseAsyncInitialState,
    cinemas: [],
    currentCinema: null,
    paging: null,
};

export const fetchCinemasThunk = createAsyncThunk<
    ApiResponse<Cinema[]>,
    GetCinemasParams | undefined,
    { rejectValue: ApiErrorPayload }
>("cinema/fetchCinemas", async (params, { rejectWithValue }) => {
    try {
        const response = await cinemaService.getCinemas(params);
        const apiError = rejectIfNotSuccess(response);
        if (apiError) return rejectWithValue(apiError);
        return response;
    } catch (error) {
        return rejectWithValue(mapUnknownError(error));
    }
});

export const fetchCinemaByIdThunk = createAsyncThunk<
    ApiResponse<Cinema>,
    number,
    { rejectValue: ApiErrorPayload }
>("cinema/fetchById", async (cinemaId, { rejectWithValue }) => {
    try {
        const response = await cinemaService.getCinemaById(cinemaId);
        const apiError = rejectIfNotSuccess(response);
        if (apiError) return rejectWithValue(apiError);
        return response;
    } catch (error) {
        return rejectWithValue(mapUnknownError(error));
    }
});

export const fetchAllCinemasThunk = createAsyncThunk<
    ApiResponse<PagingDto<Cinema>>,
    GetAllCinemasParams | undefined,
    { rejectValue: ApiErrorPayload }
>("cinema/fetchAll", async (params, { rejectWithValue }) => {
    try {
        const response = await cinemaService.getAllCinemas(params);
        const apiError = rejectIfNotSuccess(response);
        if (apiError) return rejectWithValue(apiError);
        return response;
    } catch (error) {
        return rejectWithValue(mapUnknownError(error));
    }
});

export const createCinemaThunk = createAsyncThunk<
    ApiResponse<Cinema>,
    CinemaCreationRequest,
    { rejectValue: ApiErrorPayload }
>("cinema/create", async (request, { rejectWithValue }) => {
    try {
        const response = await cinemaService.createCinema(request);
        const apiError = rejectIfNotSuccess(response);
        if (apiError) return rejectWithValue(apiError);
        return response;
    } catch (error) {
        return rejectWithValue(mapUnknownError(error));
    }
});

export const updateCinemaThunk = createAsyncThunk<
    ApiResponse<Cinema>,
    { cinemaId: number; request: CinemaUpdateRequest },
    { rejectValue: ApiErrorPayload }
>("cinema/update", async ({ cinemaId, request }, { rejectWithValue }) => {
    try {
        const response = await cinemaService.updateCinema(cinemaId, request);
        const apiError = rejectIfNotSuccess(response);
        if (apiError) return rejectWithValue(apiError);
        return response;
    } catch (error) {
        return rejectWithValue(mapUnknownError(error));
    }
});

export const deleteCinemaThunk = createAsyncThunk<
    ApiResponse<boolean>,
    number,
    { rejectValue: ApiErrorPayload }
>("cinema/delete", async (cinemaId, { rejectWithValue }) => {
    try {
        const response = await cinemaService.deleteCinema(cinemaId);
        const apiError = rejectIfNotSuccess(response);
        if (apiError) return rejectWithValue(apiError);
        return response;
    } catch (error) {
        return rejectWithValue(mapUnknownError(error));
    }
});

const cinemaSlice = createSlice({
    name: "cinema",
    initialState,
    reducers: {
        clearCurrentCinema(state) {
            state.currentCinema = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCinemasThunk.pending, (state) => {
                state.loading = true;
                state.code = null;
                state.message = null;
            })
            .addCase(fetchCinemasThunk.fulfilled, (state, action: PayloadAction<ApiResponse<Cinema[]>>) => {
                state.loading = false;
                state.code = action.payload.code;
                state.message = action.payload.message ?? null;
                state.cinemas = action.payload.result ?? [];
            })
            .addCase(fetchCinemasThunk.rejected, (state, action) => {
                state.loading = false;
                state.code = action.payload?.code ?? "UNKNOWN_ERROR";
                state.message = action.payload?.message ?? action.error.message ?? "Request failed";
            })
            .addCase(fetchCinemaByIdThunk.pending, (state) => {
                state.loading = true;
                state.code = null;
                state.message = null;
            })
            .addCase(fetchCinemaByIdThunk.fulfilled, (state, action: PayloadAction<ApiResponse<Cinema>>) => {
                state.loading = false;
                state.code = action.payload.code;
                state.message = action.payload.message ?? null;
                state.currentCinema = action.payload.result ?? null;
            })
            .addCase(fetchCinemaByIdThunk.rejected, (state, action) => {
                state.loading = false;
                state.code = action.payload?.code ?? "UNKNOWN_ERROR";
                state.message = action.payload?.message ?? action.error.message ?? "Request failed";
            })
            .addCase(fetchAllCinemasThunk.fulfilled, (state, action: PayloadAction<ApiResponse<PagingDto<Cinema>>>) => {
                state.loading = false;
                state.code = action.payload.code;
                state.message = action.payload.message ?? null;
                state.paging = action.payload.result ?? null;
                state.cinemas = action.payload.result?.items ?? [];
            })
            .addCase(createCinemaThunk.fulfilled, (state, action: PayloadAction<ApiResponse<Cinema>>) => {
                state.loading = false;
                state.code = action.payload.code;
                state.message = action.payload.message ?? null;
                if (action.payload.result) {
                    state.cinemas.unshift(action.payload.result);
                }
            })
            .addCase(updateCinemaThunk.fulfilled, (state, action: PayloadAction<ApiResponse<Cinema>>) => {
                state.loading = false;
                state.code = action.payload.code;
                state.message = action.payload.message ?? null;
                const updated = action.payload.result;
                if (!updated) return;

                state.cinemas = state.cinemas.map((item) =>
                    item.cinemaId === updated.cinemaId ? updated : item
                );
                if (state.currentCinema?.cinemaId === updated.cinemaId) {
                    state.currentCinema = updated;
                }
            })
            .addCase(deleteCinemaThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.code = action.payload.code;
                state.message = action.payload.message ?? null;
            })
            .addMatcher(
                (action) => action.type.startsWith("cinema/") && action.type.endsWith("/pending"),
                (state) => {
                    state.loading = true;
                    state.code = null;
                    state.message = null;
                }
            )
            .addMatcher(
                (action) => action.type.startsWith("cinema/") && action.type.endsWith("/rejected"),
                (state, action: { payload?: ApiErrorPayload; error?: { message?: string } }) => {
                    state.loading = false;
                    state.code = action.payload?.code ?? "UNKNOWN_ERROR";
                    state.message = action.payload?.message ?? action.error?.message ?? "Request failed";
                }
            );
    },
});

export const { clearCurrentCinema } = cinemaSlice.actions;
export default cinemaSlice.reducer;
