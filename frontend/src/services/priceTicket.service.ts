import api from "../lib/axios";
import type { ApiResponse, ItemListDto, PagingDto } from "../types/api";
import type {
    PriceTicketCreationRequest,
    PriceTicketFilterParams,
    PriceTicketResponse,
    PriceTicketStatus,
    PriceTicketUpdateRequest,
} from "../types/price-ticket";

export const priceTicketService = {
    filterPriceTickets: async (params: PriceTicketFilterParams) => {
        const query = new URLSearchParams();
        if (params.roomTypeId) query.set("roomTypeId", String(params.roomTypeId));
        if (params.seatTypeId) query.set("seatTypeId", String(params.seatTypeId));
        if (params.status) query.set("status", params.status);
        query.set("page", String(params.page ?? 1));
        query.set("size", String(params.size ?? 10));

        const res = await api.get<ApiResponse<PagingDto<PriceTicketResponse>>>(
            `/price-ticket/filter?${query.toString()}`
        );
        return res.data;
    },

    getAllPriceTicketStatuses: async () => {
        const res = await api.get<ApiResponse<ItemListDto<PriceTicketStatus>>>("/price-ticket/statuses");
        return res.data;
    },

    createPriceTicket: async (request: PriceTicketCreationRequest) => {
        const res = await api.post<ApiResponse<PriceTicketResponse>>("/price-ticket", request);
        return res.data;
    },

    updatePriceTicket: async (priceTicketId: number, request: PriceTicketUpdateRequest) => {
        const res = await api.patch<ApiResponse<PriceTicketResponse>>(
            `/price-ticket/${priceTicketId}`,
            request
        );
        return res.data;
    },

    deletePriceTicket: async (priceTicketId: number) => {
        const res = await api.delete<ApiResponse<boolean>>(`/price-ticket/${priceTicketId}`);
        return res.data;
    },
};
