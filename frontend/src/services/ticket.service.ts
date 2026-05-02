import api from "../lib/axios";
import type { ApiResponse } from "../types/api";
import type { Ticket, TicketCreationRequest, TicketStatusUpdateRequest } from "../types/ticket";

export const ticketService = {
    createTicket: async (data: TicketCreationRequest) => {
        const res = await api.post<ApiResponse<Ticket>>(`/ticket`, data);
        return res.data;
    },

    updateTicketStatus: async (ticketId: number, data: TicketStatusUpdateRequest) => {
        const res = await api.patch<ApiResponse<Ticket>>(`/ticket/${ticketId}/status`, data);
        return res.data;
    },

    getTicketById: async (ticketId: number) => {
        const res = await api.get<ApiResponse<Ticket>>(`/ticket/${ticketId}`);
        return res.data;
    },

    getTickets: async () => {
        const res = await api.get<ApiResponse<Ticket[]>>(`/ticket`);
        return res.data;
    },
};
