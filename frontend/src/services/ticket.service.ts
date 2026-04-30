import axios from "axios";
import type { TicketCreationRequest } from "../types/ticket";

export const ticketService = {
    createTicket: async (data: TicketCreationRequest) => {
        const res = await axios.post(`/ticket/`, data);
        return res.data;
    },

    getTicketById: async (ticketId: number) => {
        const res = await axios.get(`/ticket/${ticketId}`);
        return res.data;
    },

    getTickets: async () => {
        const res = await axios.get(`/ticket`);
        return res.data;
    },
};
