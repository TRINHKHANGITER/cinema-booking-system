import api from "../lib/axios";
import type { ApiResponse, ItemListDto, PagingDto } from "../types/api";
import type {
    FullShowtimeMovieResponse,
    ShowTimeCreationRequest,
    ShowTimeResponse,
    ShowTimeSearchRequest,
    ShowTimeStatus,
    ShowTimeUpdateRequest,
    ShowtimeSearchItem,
} from "../types/showtime";

type ShowTimeSortDirection = "ASC" | "DESC";

type ShowTimeFilterParams = {
    showTimeId?: number;
    provinceId?: number;
    cinemaId?: number;
    movieTypeId?: number;
    releaseFromDate?: string;
    releaseToDate?: string;
    startTime?: string;
    endTime?: string;
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
    startTime?: string;
    endTime?: string;
};

const normalizeMovieName = (params?: ShowTimeFilterParams) =>
    params?.movieName?.trim() || params?.name?.trim() || undefined;

const normalizeTimeValue = (value?: string) => {
    if (!value) return undefined;
    const normalized = value.trim();
    if (!normalized) return undefined;
    return normalized.length === 5 ? `${normalized}:00` : normalized;
};

const addDaysToDate = (dateValue: string, days: number) => {
    const date = new Date(`${dateValue}T00:00:00`);
    if (Number.isNaN(date.getTime())) return dateValue;
    date.setDate(date.getDate() + days);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const getCurrentLocalTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
};

const buildShowTimeFilterQuery = (params?: ShowTimeFilterParams) => ({
    showTimeId: params?.showTimeId,
    provinceId: params?.provinceId,
    cinemaId: params?.cinemaId,
    movieTypeId: params?.movieTypeId,
    releaseFromDate: params?.releaseFromDate,
    releaseToDate: params?.releaseToDate,
    startTime: normalizeTimeValue(params?.startTime),
    endTime: normalizeTimeValue(params?.endTime),
    movieName: normalizeMovieName(params),
    movieId: params?.movieId,
    status: params?.status,
    page: params?.page ?? 1,
    size: params?.size ?? 10,
    sortBy: params?.sortBy ?? "showtime",
    direction: params?.direction ?? "ASC",
});

export const showTimeService = {
    getGroupedShowTimesByFilters: async (params?: ShowTimeFilterParams) => {
        const res = await api.get<ApiResponse<PagingDto<FullShowtimeMovieResponse>>>(
            "/showtime/search/grouped",
            {
                params: buildShowTimeFilterQuery(params),
            }
        );

        return res.data;
    },

    getShowTimesByFilters: async (params?: ShowTimeFilterParams) => {
        const res = await api.get<ApiResponse<PagingDto<ShowTimeResponse>>>("/showtime/search", {
            params: buildShowTimeFilterQuery(params),
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
        const res = await api.get<ApiResponse<FullShowtimeMovieResponse>>(
            `/showtime/${showTimeId}`
        );
        return res.data;
    },

    getShowTimeById_tdv: async (showTimeId: number) => {
        const res = await api.get<ApiResponse<ShowTimeResponse>>(
            `/showtime/showTimeId-tdv/${showTimeId}`
        );
        return res.data;
    },

    getShowTimesByCinema: async (cinemaId: number, params?: ShowTimeByCinemaParams) => {
        const res = await api.get<ApiResponse<PagingDto<FullShowtimeMovieResponse>>>(
            `/showtime/cinema/${cinemaId}`,
            {
                params: {
                    status: params?.status ?? "SELLING",
                    page: params?.page ?? 0,
                    size: params?.size ?? 10,
                    sortBy: params?.sortBy ?? "showtimeId",
                    direction: params?.direction ?? "ASC",
                },
            }
        );

        return res.data;
    },

    createShowTime: async (request: ShowTimeCreationRequest) => {
        const res = await api.post<ApiResponse<FullShowtimeMovieResponse>>("/showtime", request);
        return res.data;
    },

    updateShowTime: async (showTimeId: number, request: ShowTimeUpdateRequest) => {
        const res = await api.patch<ApiResponse<FullShowtimeMovieResponse>>(
            `/showtime/${showTimeId}`,
            request
        );
        return res.data;
    },

    deleteShowTime: async (showTimeId: number) => {
        const res = await api.delete<ApiResponse<boolean>>(`/showtime/${showTimeId}`);
        return res.data;
    },

    searchShowTimes: async (request: ShowTimeSearchRequest) => {
        const res = await api.post<ApiResponse<PagingDto<ShowtimeSearchItem>>>(
            "/showtime/search",
            request
        );
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
        page = 1,
        size = 10,
        sortBy = "showtimeId",
        direction: ShowTimeSortDirection = "ASC"
    ) => {
        return showTimeService.getShowTimesByFilters({
            releaseFromDate: releaseDate,
            releaseToDate: releaseDate,
            page,
            size,
            sortBy,
            direction,
        });
    },

    getUpcomingShowTimesByProvince: async (
        releaseDate: string,
        filters?: ShowTimeLocationFilterParams
    ) => {
        return showTimeService.getShowTimesByFilters({
            releaseFromDate: addDaysToDate(releaseDate, 1),
            provinceId: filters?.provinceId,
            cinemaId: filters?.cinemaId,
            status: filters?.status,
            page: filters?.page ?? 1,
            size: filters?.size ?? 10,
            sortBy: filters?.sortBy ?? "releaseDate",
            direction: filters?.direction ?? "ASC",
            startTime: filters?.startTime,
            endTime: filters?.endTime,
        });
    },

    getUpcomingGroupedShowTimesByProvince: async (
        releaseDate: string,
        filters?: ShowTimeLocationFilterParams
    ) => {
        return showTimeService.getGroupedShowTimesByFilters({
            releaseFromDate: addDaysToDate(releaseDate, 1),
            provinceId: filters?.provinceId,
            cinemaId: filters?.cinemaId,
            status: filters?.status,
            page: filters?.page ?? 1,
            size: filters?.size ?? 10,
            sortBy: filters?.sortBy ?? "releaseDate",
            direction: filters?.direction ?? "ASC",
            startTime: filters?.startTime,
            endTime: filters?.endTime,
        });
    },

    getTodayShowTimesByProvince: async (
        releaseDate: string,
        filters?: ShowTimeLocationFilterParams
    ) => {
        return showTimeService.getShowTimesByFilters({
            releaseFromDate: releaseDate,
            releaseToDate: releaseDate,
            provinceId: filters?.provinceId,
            status: filters?.status ?? "SELLING",
            page: filters?.page ?? 1,
            size: filters?.size ?? 10,
            sortBy: filters?.sortBy ?? "releaseDate",
            direction: filters?.direction ?? "ASC",
            startTime: filters?.startTime ?? getCurrentLocalTime(),
            endTime: filters?.endTime,
        });
    },

    getTodayGroupedShowTimesByProvince: async (
        releaseDate: string,
        filters?: ShowTimeLocationFilterParams
    ) => {
        return showTimeService.getGroupedShowTimesByFilters({
            releaseFromDate: releaseDate,
            releaseToDate: releaseDate,
            provinceId: filters?.provinceId,
            status: filters?.status ?? "SELLING",
            page: filters?.page ?? 1,
            size: filters?.size ?? 10,
            sortBy: filters?.sortBy ?? "releaseDate",
            direction: filters?.direction ?? "ASC",
            startTime: filters?.startTime ?? getCurrentLocalTime(),
            endTime: filters?.endTime,
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
