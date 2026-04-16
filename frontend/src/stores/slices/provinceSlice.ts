import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { provinceService } from "../../services/province.service";
import type { ApiResponse } from "../../types/api";
import type { Province, ProvinceStatus } from "../../types/province";
import {
    baseAsyncInitialState,
    mapUnknownError,
    rejectIfNotSuccess,
    type ApiErrorPayload,
} from "./sliceUtils";

export type ProvinceState = {
    loading: boolean;
    code: string | null;
    message: string | null;
    provinces: Province[];
};

const initialState: ProvinceState = {
    ...baseAsyncInitialState,
    provinces: [],
};

export const fetchProvincesThunk = createAsyncThunk<
    ApiResponse<Province[]>,
    ProvinceStatus | undefined,
    { rejectValue: ApiErrorPayload }
>("province/fetchProvinces", async (status, { rejectWithValue }) => {
    try {
        const response = await provinceService.getProvinces(status);
        const apiError = rejectIfNotSuccess(response);

        if (apiError) {
            return rejectWithValue(apiError);
        }

        return response;
    } catch (error) {
        return rejectWithValue(mapUnknownError(error));
    }
});

const provinceSlice = createSlice({
    name: "province",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchProvincesThunk.pending, (state) => {
                state.loading = true;
                state.code = null;
                state.message = null;
            })
            .addCase(fetchProvincesThunk.fulfilled, (state, action: PayloadAction<ApiResponse<Province[]>>) => {
                state.loading = false;
                state.code = action.payload.code;
                state.message = action.payload.message ?? null;
                state.provinces = action.payload.result ?? [];
            })
            .addCase(fetchProvincesThunk.rejected, (state, action) => {
                state.loading = false;
                state.code = action.payload?.code ?? "UNKNOWN_ERROR";
                state.message = action.payload?.message ?? action.error.message ?? "Request failed";
            });
    },
});

export default provinceSlice.reducer;
