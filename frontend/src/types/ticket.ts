import type { OrderEntity } from "./orders";
import type { PriceTicketEntity } from "./price-ticket";
import type { SeatEntity } from "./seat";
import type { ShowTimeEntity } from "./showtime";
import type { TicketTypeEntity } from "./ticket-type";

export type TicketStatus = "AVAILABLE" | "HELD" | "BOOKED" | "CHECKED_IN" | "CANCELLED" | "EXPIRED";

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

export type Ticket = TicketEntity;
