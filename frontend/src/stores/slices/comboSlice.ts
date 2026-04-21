import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Combo, ComboStatus } from "../../types/combo";
import type { PayloadAction } from "@reduxjs/toolkit";
import {
    baseAsyncInitialState,
    mapUnknownError,
    rejectIfNotSuccess,
    type ApiErrorPayload,
    type BaseAsyncState,
} from "./sliceUtils";
import type { ApiResponse } from "../../types/api";
import { comboService } from "../../services/combo.service";

export type ComboState = BaseAsyncState & {
    combo: Combo[];
};

const initialState: ComboState = {
    ...baseAsyncInitialState,
    combo: [],
};

export const fetchCombosThunk = createAsyncThunk<
    ApiResponse<Combo[]>,
    ComboStatus | undefined,
    { rejectValue: ApiErrorPayload }
>("combo/fetchCombos", async (status, { rejectWithValue }) => {
    try {
        const response = await comboService.getCombos(status);
        const apiError = rejectIfNotSuccess(response);

        if (apiError) return rejectWithValue(apiError);

        return response;
    } catch (error) {
        return rejectWithValue(mapUnknownError(error));
    }
});

const comboSlice = createSlice({
    name: "combo",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCombosThunk.pending, (state) => {
                state.loading = true;
                state.code = null;
                state.message = null;
            })
            .addCase(
                fetchCombosThunk.fulfilled,
                (state, action: PayloadAction<ApiResponse<Combo[]>>) => {
                    state.loading = false;
                    state.code = action.payload.code;
                    state.message = action.payload.message ?? null;
                    state.combo = action.payload.result ?? [];
                }
            )
            .addCase(fetchCombosThunk.rejected, (state, action) => {
                state.loading = false;
                state.code = action.payload?.code ?? "UNKNOWN_ERROR";
                state.message = action.payload?.message ?? action.error.message ?? "Request failed";
            });
    },
});

export default comboSlice.reducer;
