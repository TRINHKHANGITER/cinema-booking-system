import api from "../lib/axios";
import type { ApiResponse } from "../types/api";
import type { ShowDetail } from "../types/booking";

export const bookingService = {
  getShowDetail: async (showId: number) => {
    const res = await api.get<ApiResponse<ShowDetail>>(`/showtime/${showId}`);
    return res.data.result;
  },
};
