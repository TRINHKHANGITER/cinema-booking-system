import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { OrderCombo, OrderComboStatus } from "../../types/orderCombo";
import type { PayloadAction } from "@reduxjs/toolkit";
import {
    baseAsyncInitialState,
    mapUnknownError,
    rejectIfNotSuccess,
    type ApiErrorPayload,
    type BaseAsyncState,
} from "./sliceUtils";
import type { ApiResponse } from "../../types/api";
import { orderComboService } from "../../services/orderCombo.service";

export type OrderComboState = BaseAsyncState & {
    orderCombo: OrderCombo[];
};

const initialState: OrderComboState = {
    ...baseAsyncInitialState,
    orderCombo: [],
};

export const fetchOrderCombosThunk = createAsyncThunk<
    ApiResponse<OrderCombo[]>,
    OrderComboStatus | undefined,
    { rejectValue: ApiErrorPayload }
>("orderCombo/fetchOrderCombos", async (status, { rejectWithValue }) => {
    try {
        const response = await orderComboService.getOrdersCombo(status);
        const apiError = rejectIfNotSuccess(response);

        if (apiError) return rejectWithValue(apiError);

        return response;
    } catch (error) {
        return rejectWithValue(mapUnknownError(error));
    }
});

const orderComboSlice = createSlice({
    name: "orderCombo",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchOrderCombosThunk.pending, (state) => {
                state.loading = true;
                state.code = null;
                state.message = null;
            })
            .addCase(
                fetchOrderCombosThunk.fulfilled,
                (state, action: PayloadAction<ApiResponse<OrderCombo[]>>) => {
                    state.loading = false;
                    state.code = action.payload.code;
                    state.message = action.payload.message ?? null;
                    state.orderCombo = action.payload.result ?? [];
                }
            )
            .addCase(fetchOrderCombosThunk.rejected, (state, action) => {
                state.loading = false;
                state.code = action.payload?.code ?? "UNKNOWN_ERROR";
                state.message = action.payload?.message ?? action.error.message ?? "Request failed";
            });
    },
});

export default orderComboSlice.reducer;
