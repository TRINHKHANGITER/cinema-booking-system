import api from "../lib/axios";
import type { ApiResponse, ItemListDto, PagingDto } from "../types/api";
import type {
    MovieTypeCreationRequest,
    MovieTypeFilterParams,
    MovieTypeResponse,
    MovieTypeStatus,
    MovieTypeUpdateRequest,
} from "../types/movie-type";

export const movieTypeService = {
    getMovieTypeItemList: async (status?: MovieTypeStatus) => {
        const res = await api.get<ApiResponse<ItemListDto<MovieTypeResponse>>>("/movie-type", {
            params: {
                status,
            },
        });
        return res.data;
    },

    filterMovieTypes: async (params: MovieTypeFilterParams) => {
        const query = new URLSearchParams();
        if (params.name?.trim()) query.set("name", params.name.trim());
        if (params.status) query.set("status", params.status);
        query.set("page", String(params.page ?? 1));
        query.set("size", String(params.size ?? 10));

        const res = await api.get<ApiResponse<PagingDto<MovieTypeResponse>>>(
            `/movie-type/filter?${query.toString()}`
        );
        return res.data;
    },

    getAllMovieTypeStatuses: async () => {
        const res = await api.get<ApiResponse<ItemListDto<MovieTypeStatus>>>("/movie-type/statuses");
        return res.data;
    },

    createMovieType: async (request: MovieTypeCreationRequest) => {
        const res = await api.post<ApiResponse<MovieTypeResponse>>("/movie-type", request);
        return res.data;
    },

    updateMovieType: async (movieTypeId: number, request: MovieTypeUpdateRequest) => {
        const res = await api.patch<ApiResponse<MovieTypeResponse>>(
            `/movie-type/${movieTypeId}`,
            request
        );
        return res.data;
    },

    deleteMovieType: async (movieTypeId: number) => {
        const res = await api.delete<ApiResponse<boolean>>(`/movie-type/${movieTypeId}`);
        return res.data;
    },
};
