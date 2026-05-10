import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { showTimeService } from "../../services/showtimeService";
import type { ApiResponse, PagingDto } from "../../types/api";
import type {
    FullShowtimeMovieResponse,
    ShowTimeCreationRequest,
    ShowTimeResponse,
    ShowTimeSearchRequest,
    ShowTimeStatus,
    ShowTimeUpdateRequest,
    ShowtimeSearchItem,
} from "../../types/showtime";
import {
    baseAsyncInitialState,
    mapUnknownError,
    rejectIfNotSuccess,
    type ApiErrorPayload,
} from "./sliceUtils";

type ShowTimeSortDirection = "ASC" | "DESC";

type ShowTimeFilterParams = {
    provinceId?: number;
    cinemaId?: number;
    movieTypeId?: number;
    releaseFromDate?: string;
    releaseToDate?: string;
    startTime?: string;
    endTime?: string;
    movieName?: string;
    name?: string;
    movieId?: number;
    status?: ShowTimeStatus;
    page?: number;
    size?: number;
    sortBy?: string;
    direction?: ShowTimeSortDirection;
};

type ShowTimeByCinemaParams = {
    status?: ShowTimeStatus;
    page?: number;
    size?: number;
    sortBy?: string;
    direction?: ShowTimeSortDirection;
};

export type ShowTimeState = {
    loading: boolean;
    code: string | null;
    message: string | null;
    showtimes: Array<ShowTimeResponse | FullShowtimeMovieResponse>;
    currentShowtime: FullShowtimeMovieResponse | null;
    paging: PagingDto<ShowTimeResponse | FullShowtimeMovieResponse> | null;
    searchItems: ShowtimeSearchItem[];
    selectedDate: string;
};

const initialState: ShowTimeState = {
    ...baseAsyncInitialState,
    showtimes: [],
    currentShowtime: null,
    paging: null,
    searchItems: [],
    selectedDate: new Date().toISOString().slice(0, 10),
};

export const fetchShowTimesByFiltersThunk = createAsyncThunk<
    ApiResponse<PagingDto<ShowTimeResponse>>,
    ShowTimeFilterParams | undefined,
    { rejectValue: ApiErrorPayload }
>("showtime/fetchByFilters", async (params, { rejectWithValue }) => {
    try {
        const response = await showTimeService.getShowTimesByFilters(params);
        const apiError = rejectIfNotSuccess(response);
        if (apiError) return rejectWithValue(apiError);
        return response;
    } catch (error) {
        return rejectWithValue(mapUnknownError(error));
    }
});

export const fetchShowTimeByIdThunk = createAsyncThunk<
    ApiResponse<FullShowtimeMovieResponse>,
    number,
    { rejectValue: ApiErrorPayload }
>("showtime/fetchById", async (showTimeId, { rejectWithValue }) => {
    try {
        const response = await showTimeService.getShowTimeById(showTimeId);
        const apiError = rejectIfNotSuccess(response);
        if (apiError) return rejectWithValue(apiError);
        return response;
    } catch (error) {
        return rejectWithValue(mapUnknownError(error));
    }
});

export const fetchShowTimesByCinemaThunk = createAsyncThunk<
    ApiResponse<PagingDto<FullShowtimeMovieResponse>>,
    { cinemaId: number; params?: ShowTimeByCinemaParams },
    { rejectValue: ApiErrorPayload }
>("showtime/fetchByCinema", async ({ cinemaId, params }, { rejectWithValue }) => {
    try {
        const response = await showTimeService.getShowTimesByCinema(cinemaId, params);
        const apiError = rejectIfNotSuccess(response);
        if (apiError) return rejectWithValue(apiError);
        return response;
    } catch (error) {
        return rejectWithValue(mapUnknownError(error));
    }
});

export const searchShowTimesThunk = createAsyncThunk<
    ApiResponse<PagingDto<ShowtimeSearchItem>>,
    ShowTimeSearchRequest,
    { rejectValue: ApiErrorPayload }
>("showtime/search", async (request, { rejectWithValue }) => {
    try {
        const response = await showTimeService.searchShowTimes(request);
        const apiError = rejectIfNotSuccess(response);
        if (apiError) return rejectWithValue(apiError);
        return response;
    } catch (error) {
        return rejectWithValue(mapUnknownError(error));
    }
});

export const fetchShowTimesByMovieIdThunk = createAsyncThunk<
    ApiResponse<PagingDto<ShowTimeResponse>>,
    { movieId: number; status?: ShowTimeStatus; page?: number; size?: number },
    { rejectValue: ApiErrorPayload }
>("showtime/fetchByMovie", async ({ movieId, status, page, size }, { rejectWithValue }) => {
    try {
        const response = await showTimeService.getShowTimesByMovieId(
            movieId,
            status ?? "SELLING",
            page ?? 1,
            size ?? 10
        );
        const apiError = rejectIfNotSuccess(response);
        if (apiError) return rejectWithValue(apiError);
        return response;
    } catch (error) {
        return rejectWithValue(mapUnknownError(error));
    }
});

export const createShowTimeThunk = createAsyncThunk<
    ApiResponse<FullShowtimeMovieResponse>,
    ShowTimeCreationRequest,
    { rejectValue: ApiErrorPayload }
>("showtime/create", async (request, { rejectWithValue }) => {
    try {
        const response = await showTimeService.createShowTime(request);
        const apiError = rejectIfNotSuccess(response);
        if (apiError) return rejectWithValue(apiError);
        return response;
    } catch (error) {
        return rejectWithValue(mapUnknownError(error));
    }
});

export const updateShowTimeThunk = createAsyncThunk<
    ApiResponse<FullShowtimeMovieResponse>,
    { showTimeId: number; request: ShowTimeUpdateRequest },
    { rejectValue: ApiErrorPayload }
>("showtime/update", async ({ showTimeId, request }, { rejectWithValue }) => {
    try {
        const response = await showTimeService.updateShowTime(showTimeId, request);
        const apiError = rejectIfNotSuccess(response);
        if (apiError) return rejectWithValue(apiError);
        return response;
    } catch (error) {
        return rejectWithValue(mapUnknownError(error));
    }
});

export const deleteShowTimeThunk = createAsyncThunk<
    ApiResponse<boolean>,
    number,
    { rejectValue: ApiErrorPayload }
>("showtime/delete", async (showTimeId, { rejectWithValue }) => {
    try {
        const response = await showTimeService.deleteShowTime(showTimeId);
        const apiError = rejectIfNotSuccess(response);
        if (apiError) return rejectWithValue(apiError);
        return response;
    } catch (error) {
        return rejectWithValue(mapUnknownError(error));
    }
});

const showtimeSlice = createSlice({
    name: "showtime",
    initialState,
    reducers: {
        setSelectedDate(state, action: PayloadAction<string>) {
            state.selectedDate = action.payload;
        },
        clearCurrentShowtime(state) {
            state.currentShowtime = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(
                fetchShowTimesByFiltersThunk.fulfilled,
                (state, action: PayloadAction<ApiResponse<PagingDto<ShowTimeResponse>>>) => {
                    state.loading = false;
                    state.code = action.payload.code;
                    state.message = action.payload.message ?? null;
                    state.paging = action.payload.result ?? null;
                    state.showtimes = action.payload.result?.items ?? [];
                }
            )
            .addCase(
                fetchShowTimeByIdThunk.fulfilled,
                (state, action: PayloadAction<ApiResponse<FullShowtimeMovieResponse>>) => {
                    state.loading = false;
                    state.code = action.payload.code;
                    state.message = action.payload.message ?? null;
                    state.currentShowtime = action.payload.result ?? null;
                }
            )
            .addCase(
                fetchShowTimesByCinemaThunk.fulfilled,
                (state, action: PayloadAction<ApiResponse<PagingDto<FullShowtimeMovieResponse>>>) => {
                    state.loading = false;
                    state.code = action.payload.code;
                    state.message = action.payload.message ?? null;
                    state.paging = action.payload.result ?? null;
                    state.showtimes = action.payload.result?.items ?? [];
                }
            )
            .addCase(
                fetchShowTimesByMovieIdThunk.fulfilled,
                (state, action: PayloadAction<ApiResponse<PagingDto<ShowTimeResponse>>>) => {
                    state.loading = false;
                    state.code = action.payload.code;
                    state.message = action.payload.message ?? null;
                    state.paging = action.payload.result ?? null;
                    state.showtimes = action.payload.result?.items ?? [];
                }
            )
            .addCase(
                searchShowTimesThunk.fulfilled,
                (state, action: PayloadAction<ApiResponse<PagingDto<ShowtimeSearchItem>>>) => {
                    state.loading = false;
                    state.code = action.payload.code;
                    state.message = action.payload.message ?? null;
                    state.searchItems = action.payload.result?.items ?? [];
                }
            )
            .addCase(
                createShowTimeThunk.fulfilled,
                (state, action: PayloadAction<ApiResponse<FullShowtimeMovieResponse>>) => {
                    state.loading = false;
                    state.code = action.payload.code;
                    state.message = action.payload.message ?? null;
                    const created = action.payload.result;
                    if (!created) return;
                    const movieId = created.movie?.movieId;
                    if (!movieId) {
                        state.showtimes.push(created);
                        return;
                    }

                    const existingIndex = state.showtimes.findIndex(
                        (item) => "movie" in item && item.movie?.movieId === movieId
                    );
                    if (existingIndex >= 0) {
                        state.showtimes[existingIndex] = created;
                    } else {
                        state.showtimes.push(created);
                    }
                }
            )
            .addCase(
                updateShowTimeThunk.fulfilled,
                (state, action: PayloadAction<ApiResponse<FullShowtimeMovieResponse>>) => {
                    state.loading = false;
                    state.code = action.payload.code;
                    state.message = action.payload.message ?? null;
                    const updated = action.payload.result;
                    if (!updated) return;
                    const movieId = updated.movie?.movieId;
                    if (!movieId) return;

                    state.showtimes = state.showtimes.map((item) =>
                        "movie" in item && item.movie?.movieId === movieId ? updated : item
                    );
                    if (state.currentShowtime?.movie?.movieId === movieId) {
                        state.currentShowtime = updated;
                    }
                }
            )
            .addCase(deleteShowTimeThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.code = action.payload.code;
                state.message = action.payload.message ?? null;
            })
            .addMatcher(
                (action) => action.type.startsWith("showtime/") && action.type.endsWith("/pending"),
                (state) => {
                    state.loading = true;
                    state.code = null;
                    state.message = null;
                }
            )
            .addMatcher(
                (action) =>
                    action.type.startsWith("showtime/") && action.type.endsWith("/rejected"),
                (state, action: { payload?: ApiErrorPayload; error?: { message?: string } }) => {
                    state.loading = false;
                    state.code = action.payload?.code ?? "UNKNOWN_ERROR";
                    state.message =
                        action.payload?.message ?? action.error?.message ?? "Request failed";
                }
            );
    },
});

export const { setSelectedDate, clearCurrentShowtime } = showtimeSlice.actions;
export default showtimeSlice.reducer;

