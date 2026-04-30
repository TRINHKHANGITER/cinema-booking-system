import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Ticket } from "../../types/ticket";
import type { PayloadAction } from "@reduxjs/toolkit";
import {
    baseAsyncInitialState,
    mapUnknownError,
    rejectIfNotSuccess,
    type ApiErrorPayload,
    type BaseAsyncState,
} from "./sliceUtils";
import type { ApiResponse } from "../../types/api";
import { ticketService } from "../../services/ticket.service";

export type TicketState = BaseAsyncState & {
    ticket: Ticket[];
};

const initialState: TicketState = {
    ...baseAsyncInitialState,
    ticket: [],
};

export const fetchTicketsThunk = createAsyncThunk<
    ApiResponse<Ticket[]>,
    void,
    { rejectValue: ApiErrorPayload }
>("ticket/fetchTickets", async (_, { rejectWithValue }) => {
    try {
        const response = await ticketService.getTickets();
        const apiError = rejectIfNotSuccess(response);

        if (apiError) return rejectWithValue(apiError);

        return response;
    } catch (error) {
        return rejectWithValue(mapUnknownError(error));
    }
});

const ticketSlice = createSlice({
    name: "ticket",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchTicketsThunk.pending, (state) => {
                state.loading = true;
                state.code = null;
                state.message = null;
            })
            .addCase(
                fetchTicketsThunk.fulfilled,
                (state, action: PayloadAction<ApiResponse<Ticket[]>>) => {
                    state.loading = false;
                    state.code = action.payload.code;
                    state.message = action.payload.message ?? null;
                    state.ticket = action.payload.result ?? [];
                }
            )
            .addCase(fetchTicketsThunk.rejected, (state, action) => {
                state.loading = false;
                state.code = action.payload?.code ?? "UNKNOWN_ERROR";
                state.message = action.payload?.message ?? action.error.message ?? "Request failed";
            });
    },
});

export default ticketSlice.reducer;
