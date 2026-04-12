import api from "../lib/axios";
import type { ApiResponse, PagingDto } from "../types/api";
import type { Seat } from "../types/seat";

export const seatService = {
  getSeatByRoom: async (roomId: number) => {
    const res = await api.get<ApiResponse<PagingDto<Seat>>>("/seat/all/0", {
      params: {
        cinemaId: roomId,
        status: "ACTIVE",
        page: 1,
        size: 500,
      },
    });

    return res.data.result?.items ?? [];
  },
};
