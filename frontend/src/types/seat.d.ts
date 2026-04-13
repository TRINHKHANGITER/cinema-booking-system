import type { RoomResponse } from "./room";
import type { SeatTypeResponse } from "./seat-type";

export type SeatStatus = "ACTIVE" | "BLOCKED" | "BROKEN";

export type SeatCreationResquest = {
    seatRow: string;
    seatColumn: number;
    seatTypeId: number;
    roomId: number;
};

export type SeatUpdateResquest = {
    seatRow?: string;
    seatColumn?: number;
    seatTypeId?: number;
    roomId?: number;
};

export type SeatResponse = {
    seatId: number;
    seatRow: string;
    seatColumn: number;
    seatType: SeatTypeResponse;
    room: RoomResponse;
    seatTypeId: number;
    roomId: number;
    status: SeatStatus;
};

export type { SeatTypeStatus } from "./seat-type";
export type SeatCreationRequest = SeatCreationResquest;
export type SeatUpdateRequest = SeatUpdateResquest;
export type SeatType = SeatTypeResponse;
export type Seat = SeatResponse & { isPrimary?: boolean };
