import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { showTimeSeatService } from "../../services/showtimeSeat.service";
import type { ApiResponse } from "../../types/api";
import type { SeatRoomEvent, ShowTimeSeat } from "../../types/showtime-seat";
import {
    baseAsyncInitialState,
    mapUnknownError,
    rejectIfNotSuccess,
    type ApiErrorPayload,
} from "./sliceUtils";

type ShowTimeSeatState = {
    loading: boolean;
    code: string | null;
    message: string | null;
    seatMapByShowTimeId: Record<number, ShowTimeSeat[]>;
    loadingByShowTimeId: Record<number, boolean>;
    lastEventTypeByShowTimeId: Record<number, string | null>;
    socketConnectedByShowTimeId: Record<number, boolean>;
};

const initialState: ShowTimeSeatState = {
    ...baseAsyncInitialState,
    seatMapByShowTimeId: {},
    loadingByShowTimeId: {},
    lastEventTypeByShowTimeId: {},
    socketConnectedByShowTimeId: {},
};

export const fetchShowTimeSeatMapThunk = createAsyncThunk<
    { showTimeId: number; response: ApiResponse<ShowTimeSeat[]> },
    number,
    { rejectValue: ApiErrorPayload }
>("showtimeSeat/fetchSeatMap", async (showTimeId, { rejectWithValue }) => {
    try {
        const response = await showTimeSeatService.getSeatMap(showTimeId);
        const apiError = rejectIfNotSuccess(response);
        if (apiError) return rejectWithValue(apiError);
        return { showTimeId, response };
    } catch (error) {
        return rejectWithValue(mapUnknownError(error));
    }
});

const sortSeatMap = (seatMap: ShowTimeSeat[]) =>
    [...seatMap].sort((first, second) => {
        if (first.seatRow === second.seatRow) {
            return first.seatColumn - second.seatColumn;
        }
        return first.seatRow.localeCompare(second.seatRow);
    });

const showtimeSeatSlice = createSlice({
    name: "showtimeSeat",
    initialState,
    reducers: {
        upsertSeatMap(state, action: PayloadAction<{ showTimeId: number; seats: ShowTimeSeat[] }>) {
            const { showTimeId, seats } = action.payload;
            state.seatMapByShowTimeId[showTimeId] = sortSeatMap(seats ?? []);
        },
        applySeatRoomEvent(state, action: PayloadAction<SeatRoomEvent>) {
            const event = action.payload;
            if (!event?.showTimeId) return;

            state.seatMapByShowTimeId[event.showTimeId] = sortSeatMap(event.seats ?? []);
            state.lastEventTypeByShowTimeId[event.showTimeId] = event.type ?? null;
        },
        setSeatSocketConnected(
            state,
            action: PayloadAction<{ showTimeId: number; connected: boolean }>
        ) {
            const { showTimeId, connected } = action.payload;
            state.socketConnectedByShowTimeId[showTimeId] = connected;
        },
        clearShowTimeSeatState(state, action: PayloadAction<{ showTimeId?: number } | undefined>) {
            const showTimeId = action.payload?.showTimeId;
            if (!showTimeId) {
                state.seatMapByShowTimeId = {};
                state.loadingByShowTimeId = {};
                state.lastEventTypeByShowTimeId = {};
                state.socketConnectedByShowTimeId = {};
                return;
            }

            delete state.seatMapByShowTimeId[showTimeId];
            delete state.loadingByShowTimeId[showTimeId];
            delete state.lastEventTypeByShowTimeId[showTimeId];
            delete state.socketConnectedByShowTimeId[showTimeId];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchShowTimeSeatMapThunk.pending, (state, action) => {
                const showTimeId = action.meta.arg;
                state.loading = true;
                state.code = null;
                state.message = null;
                state.loadingByShowTimeId[showTimeId] = true;
            })
            .addCase(
                fetchShowTimeSeatMapThunk.fulfilled,
                (
                    state,
                    action: PayloadAction<{ showTimeId: number; response: ApiResponse<ShowTimeSeat[]> }>
                ) => {
                    const { showTimeId, response } = action.payload;
                    state.loading = false;
                    state.code = response.code;
                    state.message = response.message ?? null;
                    state.loadingByShowTimeId[showTimeId] = false;
                    state.seatMapByShowTimeId[showTimeId] = sortSeatMap(response.result ?? []);
                }
            )
            .addCase(fetchShowTimeSeatMapThunk.rejected, (state, action) => {
                const showTimeId = action.meta.arg;
                state.loading = false;
                state.code = action.payload?.code ?? "UNKNOWN_ERROR";
                state.message = action.payload?.message ?? action.error.message ?? "Request failed";
                state.loadingByShowTimeId[showTimeId] = false;
            });
    },
});

export const {
    upsertSeatMap,
    applySeatRoomEvent,
    setSeatSocketConnected,
    clearShowTimeSeatState,
} = showtimeSeatSlice.actions;

export default showtimeSeatSlice.reducer;
