import api from "../lib/axios";
import type { ApiResponse, PagingDto } from "../types/api";
import type { Seat, SeatCreationRequest, SeatStatus } from "../types/seat";

type GetAllSeatsParams = {
    cinemaId?: number;
    seatTypeId?: number;
    status?: SeatStatus;
    page?: number;
    size?: number;
};

export const seatService = {
    getSeatsByRoom: async (roomId: number, status: SeatStatus = "ACTIVE") => {
        const res = await api.get<ApiResponse<Seat[]>>("/seat", {
            params: {
                roomId,
                status,
            },
        });

        return res.data;
    },

    getSeatById: async (seatId: number) => {
        const res = await api.get<ApiResponse<Seat>>(`/seat/${seatId}`);
        return res.data;
    },

    createSeat: async (request: SeatCreationRequest) => {
        const res = await api.post<ApiResponse<Seat>>("/seat", request);
        return res.data;
    },

    getAllSeats: async (cinemaId: number, params?: GetAllSeatsParams) => {
        const res = await api.get<ApiResponse<PagingDto<Seat>>>(`/seat/all/${cinemaId}`, {
            params: {
                cinemaId: params?.cinemaId ?? cinemaId,
                seatTypeId: params?.seatTypeId,
                status: params?.status,
                page: params?.page ?? 1,
                size: params?.size ?? 10,
            },
        });

        return res.data;
    },

    updateSeat: async (seatId: number, request: SeatCreationRequest) => {
        const res = await api.patch<ApiResponse<Seat>>(`/seat/${seatId}`, request);
        return res.data;
    },

    deleteSeat: async (seatId: number) => {
        const res = await api.delete<ApiResponse<boolean>>(`/seat/${seatId}`);
        return res.data;
    },
};
