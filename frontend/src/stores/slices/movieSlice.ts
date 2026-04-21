import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { movieService } from "../../services/movie.service";
import type { ApiResponse, PagingDto } from "../../types/api";
import type {
    Movie,
    MovieCreationRequest,
    MovieStatus,
    MovieUpdateRequest,
} from "../../types/movie";
import {
    baseAsyncInitialState,
    mapUnknownError,
    rejectIfNotSuccess,
    type ApiErrorPayload,
} from "./sliceUtils";

type MovieListParams = {
    cinemaId?: number;
    movieTypeId?: number;
    status?: MovieStatus;
    page?: number;
    size?: number;
};

export type MovieState = {
    loading: boolean;
    code: string | null;
    message: string | null;
    movies: Movie[];
    currentMovie: Movie | null;
    paging: PagingDto<Movie> | null;
};

const initialState: MovieState = {
    ...baseAsyncInitialState,
    movies: [],
    currentMovie: null,
    paging: null,
};

export const fetchMovieByIdThunk = createAsyncThunk<
    ApiResponse<Movie>,
    { movieId: number; status?: MovieStatus },
    { rejectValue: ApiErrorPayload }
>("movie/fetchById", async ({ movieId, status }, { rejectWithValue }) => {
    try {
        const response = await movieService.getMovieByIdAndStatus(movieId, status ?? "ACTIVE");
        const apiError = rejectIfNotSuccess(response);
        if (apiError) return rejectWithValue(apiError);
        return response;
    } catch (error) {
        return rejectWithValue(mapUnknownError(error));
    }
});

export const fetchMoviesThunk = createAsyncThunk<
    ApiResponse<PagingDto<Movie>>,
    { cinemaId: number; params?: MovieListParams },
    { rejectValue: ApiErrorPayload }
>("movie/fetchAll", async ({ cinemaId, params }, { rejectWithValue }) => {
    try {
        const response = await movieService.getAllMovies(cinemaId, params);
        const apiError = rejectIfNotSuccess(response);
        if (apiError) return rejectWithValue(apiError);
        return response;
    } catch (error) {
        return rejectWithValue(mapUnknownError(error));
    }
});

export const createMovieThunk = createAsyncThunk<
    ApiResponse<Movie>,
    MovieCreationRequest | FormData,
    { rejectValue: ApiErrorPayload }
>("movie/create", async (request, { rejectWithValue }) => {
    try {
        const response = await movieService.createMovie(request);
        const apiError = rejectIfNotSuccess(response);
        if (apiError) return rejectWithValue(apiError);
        return response;
    } catch (error) {
        return rejectWithValue(mapUnknownError(error));
    }
});

export const updateMovieThunk = createAsyncThunk<
    ApiResponse<Movie>,
    { movieId: number; request: MovieUpdateRequest | FormData },
    { rejectValue: ApiErrorPayload }
>("movie/update", async ({ movieId, request }, { rejectWithValue }) => {
    try {
        const response = await movieService.updateMovie(movieId, request);
        const apiError = rejectIfNotSuccess(response);
        if (apiError) return rejectWithValue(apiError);
        return response;
    } catch (error) {
        return rejectWithValue(mapUnknownError(error));
    }
});

export const deleteMovieThunk = createAsyncThunk<
    ApiResponse<boolean>,
    number,
    { rejectValue: ApiErrorPayload }
>("movie/delete", async (movieId, { rejectWithValue }) => {
    try {
        const response = await movieService.deleteMovie(movieId);
        const apiError = rejectIfNotSuccess(response);
        if (apiError) return rejectWithValue(apiError);
        return response;
    } catch (error) {
        return rejectWithValue(mapUnknownError(error));
    }
});

const movieSlice = createSlice({
    name: "movie",
    initialState,
    reducers: {
        clearCurrentMovie(state) {
            state.currentMovie = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(
                fetchMovieByIdThunk.fulfilled,
                (state, action: PayloadAction<ApiResponse<Movie>>) => {
                    state.loading = false;
                    state.code = action.payload.code;
                    state.message = action.payload.message ?? null;
                    state.currentMovie = action.payload.result ?? null;
                }
            )
            .addCase(
                fetchMoviesThunk.fulfilled,
                (state, action: PayloadAction<ApiResponse<PagingDto<Movie>>>) => {
                    state.loading = false;
                    state.code = action.payload.code;
                    state.message = action.payload.message ?? null;
                    state.paging = action.payload.result ?? null;
                    state.movies = action.payload.result?.items ?? [];
                }
            )
            .addCase(
                createMovieThunk.fulfilled,
                (state, action: PayloadAction<ApiResponse<Movie>>) => {
                    state.loading = false;
                    state.code = action.payload.code;
                    state.message = action.payload.message ?? null;
                    if (action.payload.result) {
                        state.movies.unshift(action.payload.result);
                    }
                }
            )
            .addCase(
                updateMovieThunk.fulfilled,
                (state, action: PayloadAction<ApiResponse<Movie>>) => {
                    state.loading = false;
                    state.code = action.payload.code;
                    state.message = action.payload.message ?? null;
                    const updated = action.payload.result;
                    if (!updated) return;

                    state.movies = state.movies.map((item) =>
                        item.movieId === updated.movieId ? updated : item
                    );
                    if (state.currentMovie?.movieId === updated.movieId) {
                        state.currentMovie = updated;
                    }
                }
            )
            .addCase(deleteMovieThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.code = action.payload.code;
                state.message = action.payload.message ?? null;
            })
            .addMatcher(
                (action) => action.type.startsWith("movie/") && action.type.endsWith("/pending"),
                (state) => {
                    state.loading = true;
                    state.code = null;
                    state.message = null;
                }
            )
            .addMatcher(
                (action) => action.type.startsWith("movie/") && action.type.endsWith("/rejected"),
                (state, action: { payload?: ApiErrorPayload; error?: { message?: string } }) => {
                    state.loading = false;
                    state.code = action.payload?.code ?? "UNKNOWN_ERROR";
                    state.message =
                        action.payload?.message ?? action.error?.message ?? "Request failed";
                }
            );
    },
});

export const { clearCurrentMovie } = movieSlice.actions;
export default movieSlice.reducer;
