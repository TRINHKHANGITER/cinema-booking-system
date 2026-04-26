import api from "../lib/axios";
import type { ApiResponse, ItemListDto, PagingDto } from "../types/api";
import type {
    RoomCreationRequest,
    RoomFilterParams,
    RoomResponse,
    RoomStatus,
    RoomUpdateRequest,
} from "../types/room";

type GetRoomItemListParams = {
    cinemaId?: number;
    status?: RoomStatus;
};

export const roomService = {
    getRoomItemList: async (params?: GetRoomItemListParams) => {
        const res = await api.get<ApiResponse<ItemListDto<RoomResponse>>>("/room", {
            params: {
                cinemaId: params?.cinemaId,
                status: params?.status,
            },
        });
        return res.data;
    },

    filterRooms: async (params: RoomFilterParams) => {
        const query = new URLSearchParams();
        if (params.provinceId) query.set("provinceId", String(params.provinceId));
        if (params.cinemaId) query.set("cinemaId", String(params.cinemaId));
        if (params.roomTypeId) query.set("roomTypeId", String(params.roomTypeId));
        if (params.name?.trim()) query.set("name", params.name.trim());
        if (params.status) query.set("status", params.status);
        query.set("page", String(params.page ?? 1));
        query.set("size", String(params.size ?? 10));

        const res = await api.get<ApiResponse<PagingDto<RoomResponse>>>(`/room/filter?${query.toString()}`);
        return res.data;
    },

    getAllRoomStatuses: async () => {
        const res = await api.get<ApiResponse<ItemListDto<RoomStatus>>>("/room/statuses");
        return res.data;
    },

    createRoom: async (request: RoomCreationRequest) => {
        const res = await api.post<ApiResponse<RoomResponse>>("/room", request);
        return res.data;
    },

    updateRoom: async (roomId: number, request: RoomUpdateRequest) => {
        const res = await api.patch<ApiResponse<RoomResponse>>(`/room/${roomId}`, request);
        return res.data;
    },

    deleteRoom: async (roomId: number) => {
        const res = await api.delete<ApiResponse<boolean>>(`/room/${roomId}`);
        return res.data;
    },
};
