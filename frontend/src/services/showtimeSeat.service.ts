import api from "../lib/axios";
import type { ApiResponse } from "../types/api";
import type {
    HoldSeatRequest,
    HoldSeatResponse,
    ReleaseSeatRequest,
    ShowTimeSeat,
} from "../types/showtime-seat";

export const showTimeSeatService = {
    getSeatMap: async (showTimeId: number) => {
        const res = await api.get<ApiResponse<ShowTimeSeat[]>>(`/showtime-seat/${showTimeId}`);
        return res.data;
    },

    holdSeats: async (request: HoldSeatRequest) => {
        const res = await api.post<ApiResponse<HoldSeatResponse>>("/showtime-seat/hold", request);
        return res.data;
    },

    releaseSeats: async (request: ReleaseSeatRequest) => {
        const res = await api.post<ApiResponse<HoldSeatResponse>>("/showtime-seat/release", request);
        return res.data;
    },
};
