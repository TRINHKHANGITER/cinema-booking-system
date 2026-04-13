import type { RoomTypeResponse } from "./room-type";
import type { SeatTypeResponse } from "./seat-type";
import type { TicketTypeResponse } from "./ticket-type";

export type PriceTicketStatus = "ACTIVE" | "INACTIVE";

export type PriceTicketCreationResquest = {
    price: number;
    roomTypeId: number;
    seatTypeId: number;
    ticketTypeId: number;
};

export type PriceTicketUpdateResquest = {
    price?: number;
    roomTypeId?: number;
    seatTypeId?: number;
    ticketTypeId?: number;
};

export type PriceTicketResponse = {
    priceTicketId: number;
    price: number;
    roomType: RoomTypeResponse;
    seatType: SeatTypeResponse;
    ticketType: TicketTypeResponse;
    roomTypeId: number;
    seatTypeId: number;
    ticketTypeId: number;
    status: PriceTicketStatus;
};

export type PriceTicketCreationRequest = PriceTicketCreationResquest;
export type PriceTicketUpdateRequest = PriceTicketUpdateResquest;
export type PriceTicket = PriceTicketResponse;
