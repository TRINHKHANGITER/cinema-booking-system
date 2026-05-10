import api from "../lib/axios";
import type { ApiResponse, ItemListDto, PagingDto } from "../types/api";
import type {
    RoomTypeCreationRequest,
    RoomTypeFilterParams,
    RoomTypeResponse,
    RoomTypeStatus,
    RoomTypeUpdateRequest,
} from "../types/room-type";

export const roomTypeService = {
    getRoomTypeItemList: async (params?: {
        provinceId?: number;
        cinemaId?: number;
        status?: RoomTypeStatus;
    }) => {
        const res = await api.get<ApiResponse<ItemListDto<RoomTypeResponse>>>("/room-type", {
            params: {
                provinceId: params?.provinceId,
                cinemaId: params?.cinemaId,
                status: params?.status,
            },
        });
        return res.data;
    },

    filterRoomTypes: async (params: RoomTypeFilterParams) => {
        const query = new URLSearchParams();
        if (params.roomTypeId) query.set("roomTypeId", String(params.roomTypeId));
        if (params.name?.trim()) query.set("name", params.name.trim());
        if (params.status) query.set("status", params.status);
        query.set("page", String(params.page ?? 1));
        query.set("size", String(params.size ?? 10));

        const res = await api.get<ApiResponse<PagingDto<RoomTypeResponse>>>(
            `/room-type/filter?${query.toString()}`
        );
        return res.data;
    },

    getAllRoomTypeStatuses: async () => {
        const res = await api.get<ApiResponse<ItemListDto<RoomTypeStatus>>>("/room-type/statuses");
        return res.data;
    },

    createRoomType: async (request: RoomTypeCreationRequest) => {
        const res = await api.post<ApiResponse<RoomTypeResponse>>("/room-type", request);
        return res.data;
    },

    updateRoomType: async (roomTypeId: number, request: RoomTypeUpdateRequest) => {
        const res = await api.patch<ApiResponse<RoomTypeResponse>>(
            `/room-type/${roomTypeId}`,
            request
        );
        return res.data;
    },

    deleteRoomType: async (roomTypeId: number) => {
        const res = await api.delete<ApiResponse<boolean>>(`/room-type/${roomTypeId}`);
        return res.data;
    },
};
