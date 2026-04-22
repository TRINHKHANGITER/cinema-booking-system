import type { RoomTypeEntity, RoomTypeResponse } from "./room-type";
import type { SeatTypeEntity, SeatTypeResponse } from "./seat-type";

export type PriceTicketStatus = "ACTIVE" | "INACTIVE";

export type PriceTicketEntity = {
    priceTicketId: number;
    price: number;
    status: PriceTicketStatus;
    roomType: RoomTypeEntity;
    seatType: SeatTypeEntity;
};

export type PriceTicketCreationResquest = {
    price: number;
    roomTypeId: number;
    seatTypeId: number;
};

export type PriceTicketUpdateResquest = {
    price?: number;
    roomTypeId?: number;
    seatTypeId?: number;
};

export type PriceTicketResponse = PriceTicketEntity & {
    roomTypeId?: number;
    seatTypeId?: number;
    roomType?: RoomTypeResponse;
    seatType?: SeatTypeResponse;
};

export type PriceTicketCreationRequest = PriceTicketCreationResquest;
export type PriceTicketUpdateRequest = PriceTicketUpdateResquest;
export type PriceTicket = PriceTicketResponse;
