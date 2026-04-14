import api from "../lib/axios";
import type { ApiResponse, PagingDto } from "../types/api";
import type { ShowTimeResponse, ShowTimeStatus, ShowtimeSearchItem } from "../types/showtime";

type ShowTimeSortDirection = "ASC" | "DESC";
type ReleaseDateCondition = "EQ" | "GT" | "GTE";

type ShowTimeQueryParams = {
  provinceId?: number;
  cinemaId?: number;
  movieTypeId?: number;
  releaseDate?: string;
  releaseDateCondition?: ReleaseDateCondition;
  name?: string;
  movieId?: number;
  status?: ShowTimeStatus;
    page?: number;
    size?: number;
    sortBy?: string;
    direction?: ShowTimeSortDirection;
};

type ShowTimeLocationFilterParams = {
    provinceId?: number;
    cinemaId?: number;
    status?: ShowTimeStatus;
    page?: number;
    size?: number;
    sortBy?: string;
    direction?: ShowTimeSortDirection;
};

export const showTimeService = {
    getShowTimes: async (params?: ShowTimeQueryParams) => {
        const res = await api.get<ApiResponse<PagingDto<ShowTimeResponse>>>("/showtime", {
            params: {
                provinceId: params?.provinceId,
        cinemaId: params?.cinemaId,
        movieTypeId: params?.movieTypeId,
        releaseDate: params?.releaseDate,
        releaseDateCondition: params?.releaseDateCondition ?? "EQ",
        name: params?.name?.trim() || undefined,
        movieId: params?.movieId,
        status: params?.status,
                page: params?.page ?? 1,
                size: params?.size ?? 10,
                sortBy: params?.sortBy ?? "showtime",
                direction: params?.direction ?? "ASC",
            },
        });

        return res.data.result;
    },

    getShowTimesByFilters: async (params?: ShowTimeQueryParams) => {
        return showTimeService.getShowTimes({
            provinceId: params?.provinceId,
            cinemaId: params?.cinemaId,
            movieTypeId: params?.movieTypeId,
            releaseDate: params?.releaseDate,
            releaseDateCondition: params?.releaseDateCondition ?? "EQ",
            name: params?.name,
            movieId: params?.movieId,
            status: params?.status,
            page: params?.page ?? 1,
            size: params?.size ?? 10,
            sortBy: params?.sortBy ?? "showtime",
            direction: params?.direction ?? "ASC",
        });
    },

    getShowTimesByMovieId: async (
        movieId: number,
        status: ShowTimeStatus = "SCHEDULED",
        page = 1,
        size = 10,
        sortBy = "showtimeId",
        direction: ShowTimeSortDirection = "ASC"
    ) => {
        return showTimeService.getShowTimes({
            movieId,
            status,
            page,
            size,
            sortBy,
            direction,
        });
    },

    getShowTimesByReleaseDate: async (
    releaseDate: string,
    releaseDateCondition: ReleaseDateCondition = "EQ",
    page = 1,
    size = 10,
    sortBy = "showtimeId",
        direction: ShowTimeSortDirection = "ASC"
    ) => {
    return showTimeService.getShowTimes({
      releaseDate,
      releaseDateCondition,
      page,
      size,
      sortBy,
            direction,
        });
    },

    getUpcomingShowTimesByProvince: async (releaseDate: string, filters?: ShowTimeLocationFilterParams) => {
        return showTimeService.getShowTimes({
            releaseDate,
            releaseDateCondition: "GT",
            provinceId: filters?.provinceId,
            cinemaId: filters?.cinemaId,
            status: filters?.status,
            page: filters?.page ?? 1,
            size: filters?.size ?? 10,
            sortBy: filters?.sortBy ?? "releaseDate",
            direction: filters?.direction ?? "ASC",
        });
    },

    getTodayShowTimesByProvince: async (releaseDate: string, filters?: ShowTimeLocationFilterParams) => {
        return showTimeService.getShowTimes({
            releaseDate,
            releaseDateCondition: "EQ",
            provinceId: filters?.provinceId,
            cinemaId: filters?.cinemaId,
            status: filters?.status,
            page: filters?.page ?? 1,
            size: filters?.size ?? 10,
            sortBy: filters?.sortBy ?? "releaseDate",
            direction: filters?.direction ?? "ASC",
        });
    },

    getShowTimeByMovieKeyword: async (keyword: string) => {
        const normalizedKeyword = keyword?.trim();

        const res = await api.post<ApiResponse<PagingDto<ShowtimeSearchItem>>>("/showtime/search", {
            keyword: normalizedKeyword ? normalizedKeyword : null,
            page: 1,
            size: 200,
        });

        return res.data.result?.items ?? [];
    },
};
