import type { RoomTypeEntity, RoomTypeResponse } from "./room-type";
import type { SeatTypeEntity, SeatTypeResponse } from "./seat-type";
import type { TicketTypeEntity, TicketTypeResponse } from "./ticket-type";

export type PriceTicketStatus = "ACTIVE" | "INACTIVE";

export type PriceTicketEntity = {
    priceTicketId: number;
    price: number;
    status: PriceTicketStatus;
    roomType: RoomTypeEntity;
    seatType: SeatTypeEntity;
    ticketType: TicketTypeEntity;
};

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

export type PriceTicketResponse = PriceTicketEntity & {
    roomTypeId?: number;
    seatTypeId?: number;
    ticketTypeId?: number;
    roomType?: RoomTypeResponse;
    seatType?: SeatTypeResponse;
    ticketType?: TicketTypeResponse;
};

export type PriceTicketCreationRequest = PriceTicketCreationResquest;
export type PriceTicketUpdateRequest = PriceTicketUpdateResquest;
export type PriceTicket = PriceTicketResponse;
