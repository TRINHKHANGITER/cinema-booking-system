import type { OrderEntity } from "./order";
import type { PriceTicketEntity } from "./price-ticket";
import type { SeatEntity } from "./seat";
import type { ShowTimeEntity } from "./showtime";
import type { TicketTypeEntity } from "./ticket-type";

export type TicketStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "EXPIRED";

export type TicketEntity = {
    ticketId: number;
    order: OrderEntity | null;
    show: ShowTimeEntity;
    seat: SeatEntity;
    ticketType: TicketTypeEntity | null;
    priceTicket: PriceTicketEntity | null;
    unitPrice: number | null;
    qrCode: string | null;
    heldAt: string | null;
    heldUntil: string | null;
    bookedAt: string | null;
    checkedInAt: string | null;
    createdAt: string;
    updatedAt: string;
    status: TicketStatus;
};

export type TicketCreationRequest = {
    showTimeId: number;
    seatId: number;
    ticketTypeId: number;
};

export type Ticket = TicketEntity;
