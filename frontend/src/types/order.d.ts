import type { ComboRequest } from "./combo";
import type { Ticket, TicketCreationRequest } from "./ticket";

export type OrderStatus = "CREATED" | "PENDING" | "CONFIRMED" | "CANCELLED" | "EXPIRED";

export type OrderEntity = {
    orderId: number;
    userId: number;
    ticketTotal: number;
    comboTotal: number;
    discountAmount: number;
    totalAmount: number;
    netAmount: number;
    createdAt: string;
    updatedAt: string;
    status: OrderStatus;
};

export type OrderCreationRequest = {
    userId: number;
    // tickets: TicketCreationRequest[];
    // combos: ComboRequest[];
};

export type OrderUpdateRequest = {
    status: OrderStatus;
};

export type Order = OrderEntity;
export type OrderResponse = OrderEntity;
