import type { Ticket, TicketCreationRequest } from "./ticket";

export type OrderStatus = "PAYING" | "PAID" | "CANCELLED" | "EXPIRED" | "FAILED";

export type OrderEntity = {
    orderId: number;
    userId: number | null;
    showTimeId: number;
    ticketTotal: number;
    comboTotal: number;
    discountAmount: number;
    totalAmount: number;
    netAmount: number;
    expiredAt: string;
    createdAt: string;
    updatedAt: string;
    status: OrderStatus;
};

export type OrderCreationRequest = {
    userId?: number;
    showTimeId: number;
};

export type OrderUpdateRequest = {
    status?: OrderStatus;
};

export type Order = OrderEntity;
export type OrderResponse = OrderEntity;
