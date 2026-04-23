import api from "../lib/axios";
import type { ApiResponse, ItemListDto, PagingDto } from "../types/api";
import type {
    Province,
    ProvinceCreationRequest,
    ProvinceFilterParams,
    ProvinceResponse,
    ProvinceStatus,
    ProvinceUpdateRequest,
} from "../types/province";

export const provinceService = {
    getProvinces: async (status?: ProvinceStatus) => {
        const res = await api.get<ApiResponse<Province[]>>("/province", {
            params: {
                status,
            },
        });

        return res.data;
    },

    filterProvinces: async (params: ProvinceFilterParams) => {
        const query = new URLSearchParams();
        if (params.name?.trim()) query.set("name", params.name.trim());
        if (params.status) query.set("status", params.status);
        query.set("page", String(params.page ?? 1));
        query.set("size", String(params.size ?? 10));

        const res = await api.get<ApiResponse<PagingDto<ProvinceResponse>>>(
            `/province/filter?${query.toString()}`
        );
        return res.data;
    },

    getAllProvinceStatuses: async () => {
        const res = await api.get<ApiResponse<ItemListDto<ProvinceStatus>>>("/province/statuses");
        return res.data;
    },

    createProvince: async (request: ProvinceCreationRequest) => {
        const res = await api.post<ApiResponse<ProvinceResponse>>("/province", request);
        return res.data;
    },

    updateProvince: async (provinceId: number, request: ProvinceUpdateRequest) => {
        const res = await api.patch<ApiResponse<ProvinceResponse>>(`/province/${provinceId}`, request);
        return res.data;
    },

    deleteProvince: async (provinceId: number) => {
        const res = await api.delete<ApiResponse<boolean>>(`/province/${provinceId}`);
        return res.data;
    },
};
