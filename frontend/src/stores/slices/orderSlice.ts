import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Order, OrderStatus } from "../../types/order";
import type { PayloadAction } from "@reduxjs/toolkit";
import {
    baseAsyncInitialState,
    mapUnknownError,
    rejectIfNotSuccess,
    type ApiErrorPayload,
    type BaseAsyncState,
} from "./sliceUtils";
import type { ApiResponse } from "../../types/api";
import { orderService } from "../../services/order.service";

export type OrderState = BaseAsyncState & {
    order: Order[];
};

const initialState: OrderState = {
    ...baseAsyncInitialState,
    order: [],
};

export const fetchOrdersThunk = createAsyncThunk<
    ApiResponse<Order[]>,
    OrderStatus | undefined,
    { rejectValue: ApiErrorPayload }
>("order/fetchOrders", async (status, { rejectWithValue }) => {
    try {
        const response = await orderService.getOrders(status);
        const apiError = rejectIfNotSuccess(response);

        if (apiError) return rejectWithValue(apiError);

        return response;
    } catch (error) {
        return rejectWithValue(mapUnknownError(error));
    }
});

const orderSlice = createSlice({
    name: "order",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchOrdersThunk.pending, (state) => {
                state.loading = true;
                state.code = null;
                state.message = null;
            })
            .addCase(
                fetchOrdersThunk.fulfilled,
                (state, action: PayloadAction<ApiResponse<Order[]>>) => {
                    state.loading = false;
                    state.code = action.payload.code;
                    state.message = action.payload.message ?? null;
                    state.order = action.payload.result ?? [];
                }
            )
            .addCase(fetchOrdersThunk.rejected, (state, action) => {
                state.loading = false;
                state.code = action.payload?.code ?? "UNKNOWN_ERROR";
                state.message = action.payload?.message ?? action.error.message ?? "Request failed";
            });
    },
});

export default orderSlice.reducer;
