import type { OrderEntity } from "./order";
import type { PriceTicketEntity } from "./price-ticket";
import type { SeatEntity } from "./seat";
import type { ShowTimeEntity } from "./showtime";

export type TicketStatus = "ACTIVE" | "USED" | "CANCELLED" | "EXPIRED";

export type TicketEntity = {
    ticketId: number;
    order: OrderEntity | null;
    show: ShowTimeEntity;
    seat: SeatEntity;
    priceTicket: PriceTicketEntity | null;
    unitPrice: number | null;
    qrCode: string | null;
    checkedInAt: string | null;
    createdAt: string;
    updatedAt: string;
    status: TicketStatus;
};

export type TicketCreationRequest = {
    showTimeId: number;
    seatId: number;
};

export type Ticket = TicketEntity;
