import axiosClient from "../lib/axios";
import type { ApiResponse, PagingDto } from "../types/api";
import type { Cinema, CinemaStatus } from "../types/cinema";
import type { Movie, MovieStatus } from "../types/movie";
import type { Province, ProvinceStatus } from "../types/province";
import type { Seat, SeatStatus } from "../types/seat";
import type { ShowTimeResponse, ShowTimeStatus } from "../types/showtime";

type SortDirection = "ASC" | "DESC";
type ReleaseDateCondition = "EQ" | "GT" | "GTE";

type ShowTimeFilterParams = {
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
    direction?: SortDirection;
};

export const movieService = {
    getMovieByIdAndStatus: async (movieId: number, status?: MovieStatus) => {
        const res = await axiosClient.get<ApiResponse<Movie>>(`/movie/${movieId}`, {
            params: status ? { status } : undefined,
        });

        return res.data;
    },

    getProvinces: async (status: ProvinceStatus = "ACTIVE") => {
        const res = await axiosClient.get<ApiResponse<Province[]>>("/province", {
            params: { status },
        });

        return res.data.result ?? [];
    },

    getCinemasByProvince: async (
        provinceId: number,
        isShowing = true,
        status: CinemaStatus = "ACTIVE"
    ) => {
        const res = await axiosClient.get<ApiResponse<Cinema[]>>("/cinema", {
            params: { provinceId, isShowing, status },
        });

        return res.data.result ?? [];
    },

    getShowTimes: async (params?: ShowTimeFilterParams) => {
        const res = await axiosClient.get<ApiResponse<PagingDto<ShowTimeResponse>>>("/showtime", {
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
                sortBy: params?.sortBy ?? "showtimeId",
                direction: params?.direction ?? "ASC",
            },
        });

        return res.data.result;
    },

    getShowTimesByReleaseDate: async (
        releaseDate: string,
        releaseDateCondition: ReleaseDateCondition = "EQ",
        page = 1,
        size = 10,
        sortBy = "showtime",
        direction: SortDirection = "ASC"
    ) => {
        return movieService.getShowTimes({
            releaseDate,
            releaseDateCondition,
            page,
            size,
            sortBy,
            direction,
        });
    },

    getShowTimesByMovieIdAndStatus: async (
        movieId: number,
        status: ShowTimeStatus,
        page = 1,
        size = 10,
        sortBy = "showtimeId",
        direction: SortDirection = "ASC"
    ) => {
        return movieService.getShowTimes({
            movieId,
            status,
            page,
            size,
            sortBy,
            direction,
        });
    },

    getSeatsByRoomId: async (roomId: number, status: SeatStatus = "ACTIVE") => {
        const res = await axiosClient.get<ApiResponse<Seat[]>>("/seat", {
            params: { roomId, status },
        });

        return res.data.result ?? [];
    },
};
