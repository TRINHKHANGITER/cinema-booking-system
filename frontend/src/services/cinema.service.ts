import api from "../lib/axios";
import type { ApiResponse, ItemListDto, PagingDto } from "../types/api";
import type {
    Cinema,
    CinemaCreationRequest,
    CinemaFilterParams,
    CinemaResponse,
    CinemaStatus,
    CinemaUpdateRequest,
} from "../types/cinema";

type GetCinemasParams = {
    provinceId?: number;
    isShowing?: boolean;
    status?: CinemaStatus;
};

type GetAllCinemasParams = {
    provinceId?: number;
    page?: number;
    size?: number;
    status?: CinemaStatus;
};

export const cinemaService = {
    getCinemas: async (params?: GetCinemasParams) => {
        const res = await api.get<ApiResponse<Cinema[]>>("/cinema", {
            params: {
                provinceId: params?.provinceId,
                isShowing: params?.isShowing,
                status: params?.status,
            },
        });

        return res.data;
    },

    getCinemaById: async (cinemaId: number) => {
        const res = await api.get<ApiResponse<Cinema>>(`/cinema/${cinemaId}`);
        return res.data;
    },

    getAllCinemas: async (params?: GetAllCinemasParams) => {
        const res = await api.get<ApiResponse<PagingDto<Cinema>>>("/cinema/all", {
            params: {
                provinceId: params?.provinceId,
                page: params?.page ?? 1,
                size: params?.size ?? 10,
                status: params?.status,
            },
        });

        return res.data;
    },

    filterCinemas: async (params: CinemaFilterParams) => {
        const query = new URLSearchParams();
        if (params.name?.trim()) query.set("name", params.name.trim());
        if (params.provinceId) query.set("provinceId", String(params.provinceId));
        if (params.status) query.set("status", params.status);
        query.set("page", String(params.page ?? 1));
        query.set("size", String(params.size ?? 10));

        const res = await api.get<ApiResponse<PagingDto<CinemaResponse>>>(
            `/cinema/filter?${query.toString()}`
        );
        return res.data;
    },

    getAllCinemaStatuses: async () => {
        const res = await api.get<ApiResponse<ItemListDto<CinemaStatus>>>("/cinema/statuses");
        return res.data;
    },

    createCinema: async (request: CinemaCreationRequest) => {
        const res = await api.post<ApiResponse<CinemaResponse>>("/cinema", request);
        return res.data;
    },

    updateCinema: async (cinemaId: number, request: CinemaUpdateRequest) => {
        const res = await api.patch<ApiResponse<CinemaResponse>>(`/cinema/${cinemaId}`, request);
        return res.data;
    },

    deleteCinema: async (cinemaId: number) => {
        const res = await api.delete<ApiResponse<boolean>>(`/cinema/${cinemaId}`);
        return res.data;
    },
};

