import api from "../lib/axios";
import type { ApiResponse, ItemListDto, PagingDto } from "../types/api";
import type {
    SeatTypeCreationRequest,
    SeatTypeFilterParams,
    SeatTypeResponse,
    SeatTypeStatus,
    SeatTypeUpdateRequest,
} from "../types/seat-type";

export const seatTypeService = {
    filterSeatTypes: async (params: SeatTypeFilterParams) => {
        const query = new URLSearchParams();
        if (params.seatTypeId) query.set("seatTypeId", String(params.seatTypeId));
        if (params.name?.trim()) query.set("name", params.name.trim());
        if (params.status) query.set("status", params.status);
        query.set("page", String(params.page ?? 1));
        query.set("size", String(params.size ?? 10));

        const res = await api.get<ApiResponse<PagingDto<SeatTypeResponse>>>(
            `/seat-type/filter?${query.toString()}`
        );
        return res.data;
    },

    getAllSeatTypeStatuses: async () => {
        const res = await api.get<ApiResponse<ItemListDto<SeatTypeStatus>>>("/seat-type/statuses");
        return res.data;
    },

    createSeatType: async (request: SeatTypeCreationRequest) => {
        const res = await api.post<ApiResponse<SeatTypeResponse>>("/seat-type", request);
        return res.data;
    },

    updateSeatType: async (seatTypeId: number, request: SeatTypeUpdateRequest) => {
        const res = await api.patch<ApiResponse<SeatTypeResponse>>(
            `/seat-type/${seatTypeId}`,
            request
        );
        return res.data;
    },

    deleteSeatType: async (seatTypeId: number) => {
        const res = await api.delete<ApiResponse<boolean>>(`/seat-type/${seatTypeId}`);
        return res.data;
    },
};
