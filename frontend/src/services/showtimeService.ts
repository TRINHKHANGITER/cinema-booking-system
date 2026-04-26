import api from "../lib/axios";
import type { ApiResponse, ItemListDto, PagingDto } from "../types/api";
import type {
    ShowTimeCreationRequest,
    ShowTimeResponse,
    ShowtimeMovieResponse,
    ShowTimeSearchRequest,
    ShowTimeStatus,
    ShowTimeUpdateRequest,
    ShowtimeSearchItem,
} from "../types/showtime";

type ShowTimeSortDirection = "ASC" | "DESC";
type ReleaseDateCondition = "EQ" | "GT" | "GTE";

type ShowTimeFilterParams = {
    provinceId?: number;
    cinemaId?: number;
    movieTypeId?: number;
    releaseDate?: string;
    releaseDateCondition?: ReleaseDateCondition;
    movieName?: string;
    name?: string;
    movieId?: number;
    status?: ShowTimeStatus;
    page?: number;
    size?: number;
    sortBy?: string;
    direction?: ShowTimeSortDirection;
};

type ShowTimeByCinemaParams = {
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
    getShowTimesByFilters: async (params?: ShowTimeFilterParams) => {
        const normalizedMovieName =
            params?.movieName?.trim() || params?.name?.trim() || undefined;

        const res = await api.get<ApiResponse<PagingDto<ShowTimeResponse>>>("/showtime", {
            params: {
                provinceId: params?.provinceId,
                cinemaId: params?.cinemaId,
                movieTypeId: params?.movieTypeId,
                releaseDate: params?.releaseDate,
                releaseDateCondition: params?.releaseDateCondition ?? "EQ",
                movieName: normalizedMovieName,
                name: normalizedMovieName,
                movieId: params?.movieId,
                status: params?.status,
                page: params?.page ?? 1,
                size: params?.size ?? 10,
                sortBy: params?.sortBy ?? "showtime",
                direction: params?.direction ?? "ASC",
            },
        });

        return res.data;
    },

    getAllShowTimeStatuses: async () => {
        const res = await api.get<ApiResponse<ItemListDto<ShowTimeStatus>>>("/showtime/statuses");
        return res.data;
    },

    getShowTimes: async (params?: ShowTimeFilterParams) => {
        return showTimeService.getShowTimesByFilters(params);
    },

    getShowTimeById: async (showTimeId: number) => {
        const res = await api.get<ApiResponse<ShowtimeMovieResponse>>(`/showtime/${showTimeId}`);
        return res.data;
    },

    getShowTimesByCinema: async (cinemaId: number, params?: ShowTimeByCinemaParams) => {
        const res = await api.get<ApiResponse<PagingDto<ShowtimeMovieResponse>>>(`/showtime/cinema/${cinemaId}`, {
            params: {
                status: params?.status ?? "SELLING",
                page: params?.page ?? 0,
                size: params?.size ?? 10,
                sortBy: params?.sortBy ?? "showtimeId",
                direction: params?.direction ?? "ASC",
            },
        });

        return res.data;
    },

    createShowTime: async (request: ShowTimeCreationRequest) => {
        const res = await api.post<ApiResponse<ShowtimeMovieResponse>>("/showtime", request);
        return res.data;
    },

    updateShowTime: async (showTimeId: number, request: ShowTimeUpdateRequest) => {
        const res = await api.patch<ApiResponse<ShowtimeMovieResponse>>(`/showtime/${showTimeId}`, request);
        return res.data;
    },

    deleteShowTime: async (showTimeId: number) => {
        const res = await api.delete<ApiResponse<boolean>>(`/showtime/${showTimeId}`);
        return res.data;
    },

    searchShowTimes: async (request: ShowTimeSearchRequest) => {
        const res = await api.post<ApiResponse<PagingDto<ShowtimeSearchItem>>>("/showtime/search", request);
        return res.data;
    },

    getShowTimesByMovieId: async (
        movieId: number,
        status: ShowTimeStatus = "SELLING",
        page = 1,
        size = 10,
        sortBy = "showtimeId",
        direction: ShowTimeSortDirection = "ASC"
    ) => {
        return showTimeService.getShowTimesByFilters({
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
        return showTimeService.getShowTimesByFilters({
            releaseDate,
            releaseDateCondition,
            page,
            size,
            sortBy,
            direction,
        });
    },
    

    getUpcomingShowTimesByProvince: async (releaseDate: string, filters?: ShowTimeLocationFilterParams) => {
        return showTimeService.getShowTimesByFilters({
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
        return showTimeService.getShowTimesByFilters({
            releaseDate,
            releaseDateCondition: "EQ",
            provinceId: filters?.provinceId,
            status: filters?.status ?? "SELLING",
            page: filters?.page ?? 1,
            size: filters?.size ?? 10,
            sortBy: filters?.sortBy ?? "releaseDate",
            direction: filters?.direction ?? "ASC",
        });
    },

    getShowTimeByMovieKeyword: async (keyword: string) => {
        const normalizedKeyword = keyword?.trim();

        return showTimeService.searchShowTimes({
            keyword: normalizedKeyword ? normalizedKeyword : null,
            page: 1,
            size: 10,
        });
    },
};

