import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { seatService } from "../../services/seat.service";
import type { ApiResponse, PagingDto } from "../../types/api";
import type { Seat, SeatCreationRequest, SeatStatus } from "../../types/seat";
import {
    baseAsyncInitialState,
    mapUnknownError,
    rejectIfNotSuccess,
    type ApiErrorPayload,
} from "./sliceUtils";

type GetAllSeatsParams = {
    cinemaId?: number;
    seatTypeId?: number;
    status?: SeatStatus;
    page?: number;
    size?: number;
};

export type SeatState = {
    loading: boolean;
    code: string | null;
    message: string | null;
    seats: Seat[];
    currentSeat: Seat | null;
    paging: PagingDto<Seat> | null;
    selectedSeats: Seat[];
};

const initialState: SeatState = {
    ...baseAsyncInitialState,
    seats: [],
    currentSeat: null,
    paging: null,
    selectedSeats: [],
};

export const fetchSeatsByRoomThunk = createAsyncThunk<
    ApiResponse<Seat[]>,
    { roomId: number; status?: SeatStatus },
    { rejectValue: ApiErrorPayload }
>("seat/fetchByRoom", async ({ roomId, status }, { rejectWithValue }) => {
    try {
        const response = await seatService.getSeatsByRoom(roomId, status ?? "ACTIVE");
        const apiError = rejectIfNotSuccess(response);
        if (apiError) return rejectWithValue(apiError);
        return response;
    } catch (error) {
        return rejectWithValue(mapUnknownError(error));
    }
});

export const fetchSeatByIdThunk = createAsyncThunk<
    ApiResponse<Seat>,
    number,
    { rejectValue: ApiErrorPayload }
>("seat/fetchById", async (seatId, { rejectWithValue }) => {
    try {
        const response = await seatService.getSeatById(seatId);
        const apiError = rejectIfNotSuccess(response);
        if (apiError) return rejectWithValue(apiError);
        return response;
    } catch (error) {
        return rejectWithValue(mapUnknownError(error));
    }
});

export const fetchAllSeatsThunk = createAsyncThunk<
    ApiResponse<PagingDto<Seat>>,
    { cinemaId: number; params?: GetAllSeatsParams },
    { rejectValue: ApiErrorPayload }
>("seat/fetchAll", async ({ cinemaId, params }, { rejectWithValue }) => {
    try {
        const response = await seatService.getAllSeats(cinemaId, params);
        const apiError = rejectIfNotSuccess(response);
        if (apiError) return rejectWithValue(apiError);
        return response;
    } catch (error) {
        return rejectWithValue(mapUnknownError(error));
    }
});

export const createSeatThunk = createAsyncThunk<
    ApiResponse<Seat>,
    SeatCreationRequest,
    { rejectValue: ApiErrorPayload }
>("seat/create", async (request, { rejectWithValue }) => {
    try {
        const response = await seatService.createSeat(request);
        const apiError = rejectIfNotSuccess(response);
        if (apiError) return rejectWithValue(apiError);
        return response;
    } catch (error) {
        return rejectWithValue(mapUnknownError(error));
    }
});

export const updateSeatThunk = createAsyncThunk<
    ApiResponse<Seat>,
    { seatId: number; request: SeatCreationRequest },
    { rejectValue: ApiErrorPayload }
>("seat/update", async ({ seatId, request }, { rejectWithValue }) => {
    try {
        const response = await seatService.updateSeat(seatId, request);
        const apiError = rejectIfNotSuccess(response);
        if (apiError) return rejectWithValue(apiError);
        return response;
    } catch (error) {
        return rejectWithValue(mapUnknownError(error));
    }
});

export const deleteSeatThunk = createAsyncThunk<
    ApiResponse<boolean>,
    number,
    { rejectValue: ApiErrorPayload }
>("seat/delete", async (seatId, { rejectWithValue }) => {
    try {
        const response = await seatService.deleteSeat(seatId);
        const apiError = rejectIfNotSuccess(response);
        if (apiError) return rejectWithValue(apiError);
        return response;
    } catch (error) {
        return rejectWithValue(mapUnknownError(error));
    }
});

const seatSlice = createSlice({
    name: "seat",
    initialState,
    reducers: {
        toggleSeat(state, action: PayloadAction<Seat[]>) {
            const seats = action.payload;
            if (seats.length === 0) return;

            const ids = seats.map((item) => item.seatId);
            const isAlreadySelected = ids.every((id) =>
                state.selectedSeats.some((selected) => selected.seatId === id)
            );

            if (isAlreadySelected) {
                state.selectedSeats = state.selectedSeats.filter(
                    (selected) => !ids.includes(selected.seatId)
                );
                return;
            }

            state.selectedSeats = state.selectedSeats.filter(
                (selected) => !ids.includes(selected.seatId)
            );

            if (seats.length === 1) {
                state.selectedSeats.push({ ...seats[0], isPrimary: true });
                return;
            }

            state.selectedSeats.push({ ...seats[0], isPrimary: true });
            for (let i = 1; i < seats.length; i += 1) {
                state.selectedSeats.push({ ...seats[i], isPrimary: false });
            }
        },
        resetSelectedSeats(state) {
            state.selectedSeats = [];
        },
        clearCurrentSeat(state) {
            state.currentSeat = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSeatsByRoomThunk.fulfilled, (state, action: PayloadAction<ApiResponse<Seat[]>>) => {
                state.loading = false;
                state.code = action.payload.code;
                state.message = action.payload.message ?? null;
                state.seats = action.payload.result ?? [];
            })
            .addCase(fetchSeatByIdThunk.fulfilled, (state, action: PayloadAction<ApiResponse<Seat>>) => {
                state.loading = false;
                state.code = action.payload.code;
                state.message = action.payload.message ?? null;
                state.currentSeat = action.payload.result ?? null;
            })
            .addCase(fetchAllSeatsThunk.fulfilled, (state, action: PayloadAction<ApiResponse<PagingDto<Seat>>>) => {
                state.loading = false;
                state.code = action.payload.code;
                state.message = action.payload.message ?? null;
                state.paging = action.payload.result ?? null;
                state.seats = action.payload.result?.items ?? [];
            })
            .addCase(createSeatThunk.fulfilled, (state, action: PayloadAction<ApiResponse<Seat>>) => {
                state.loading = false;
                state.code = action.payload.code;
                state.message = action.payload.message ?? null;
                if (action.payload.result) {
                    state.seats.push(action.payload.result);
                }
            })
            .addCase(updateSeatThunk.fulfilled, (state, action: PayloadAction<ApiResponse<Seat>>) => {
                state.loading = false;
                state.code = action.payload.code;
                state.message = action.payload.message ?? null;
                const updated = action.payload.result;
                if (!updated) return;

                state.seats = state.seats.map((item) => (item.seatId === updated.seatId ? updated : item));
                if (state.currentSeat?.seatId === updated.seatId) {
                    state.currentSeat = updated;
                }
            })
            .addCase(deleteSeatThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.code = action.payload.code;
                state.message = action.payload.message ?? null;
            })
            .addMatcher(
                (action) => action.type.startsWith("seat/") && action.type.endsWith("/pending"),
                (state) => {
                    state.loading = true;
                    state.code = null;
                    state.message = null;
                }
            )
            .addMatcher(
                (action) => action.type.startsWith("seat/") && action.type.endsWith("/rejected"),
                (state, action: { payload?: ApiErrorPayload; error?: { message?: string } }) => {
                    state.loading = false;
                    state.code = action.payload?.code ?? "UNKNOWN_ERROR";
                    state.message = action.payload?.message ?? action.error?.message ?? "Request failed";
                }
            );
    },
});

export const { toggleSeat, resetSelectedSeats, clearCurrentSeat } = seatSlice.actions;
export default seatSlice.reducer;
