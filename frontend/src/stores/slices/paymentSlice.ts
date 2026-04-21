import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Payment, PaymentStatus } from "../../types/payment";
import type { PayloadAction } from "@reduxjs/toolkit";
import {
    baseAsyncInitialState,
    mapUnknownError,
    rejectIfNotSuccess,
    type ApiErrorPayload,
    type BaseAsyncState,
} from "./sliceUtils";
import type { ApiResponse } from "../../types/api";
import { paymentService } from "../../services/payment.service";

export type PaymentState = BaseAsyncState & {
    payment: Payment[];
};

const initialState: PaymentState = {
    ...baseAsyncInitialState,
    payment: [],
};

export const fetchPaymentsThunk = createAsyncThunk<
    ApiResponse<Payment[]>,
    PaymentStatus | undefined,
    { rejectValue: ApiErrorPayload }
>("payment/fetchPayments", async (status, { rejectWithValue }) => {
    try {
        const response = await paymentService.getPayments(status);
        const apiError = rejectIfNotSuccess(response);

        if (apiError) return rejectWithValue(apiError);

        return response;
    } catch (error) {
        return rejectWithValue(mapUnknownError(error));
    }
});

const paymentSlice = createSlice({
    name: "payment",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPaymentsThunk.pending, (state) => {
                state.loading = true;
                state.code = null;
                state.message = null;
            })
            .addCase(
                fetchPaymentsThunk.fulfilled,
                (state, action: PayloadAction<ApiResponse<Payment[]>>) => {
                    state.loading = false;
                    state.code = action.payload.code;
                    state.message = action.payload.message ?? null;
                    state.payment = action.payload.result ?? [];
                }
            )
            .addCase(fetchPaymentsThunk.rejected, (state, action) => {
                state.loading = false;
                state.code = action.payload?.code ?? "UNKNOWN_ERROR";
                state.message = action.payload?.message ?? action.error.message ?? "Request failed";
            });
    },
});

export default paymentSlice.reducer;
