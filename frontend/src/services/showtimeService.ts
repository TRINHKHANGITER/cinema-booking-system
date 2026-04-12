import api from "../lib/axios";
import type { ApiResponse, PagingDto } from "../types/api";
import type { ShowtimeSearchItem } from "../types/showtime";

export const showTimeService = {
  getShowTimeByMovieKeyword: async (keyword: string) => {
    const normalizedKeyword = keyword?.trim();

    const res = await api.post<ApiResponse<PagingDto<ShowtimeSearchItem>>>(
      "/showtime/search",
      {
        keyword: normalizedKeyword ? normalizedKeyword : null,
        page: 1,
        size: 200,
      },
    );

    return res.data.result?.items ?? [];
  },
};
