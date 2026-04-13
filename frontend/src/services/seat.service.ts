import api from "../lib/axios";
import type { ApiResponse } from "../types/api";
import type { Seat, SeatStatus } from "../types/seat";

export const seatService = {
    getSeatByRoom: async (roomId: number, status: SeatStatus = "ACTIVE") => {
        const res = await api.get<ApiResponse<Seat[]>>("/seat", {
            params: {
                roomId,
                status,
            },
        });

        return res.data.result ?? [];
    },
};
