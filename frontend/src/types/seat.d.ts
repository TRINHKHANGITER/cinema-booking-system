import type { RoomEntity, RoomResponse } from "./room";
import type { SeatTypeEntity, SeatTypeResponse } from "./seat-type";

export type SeatStatus = "ACTIVE" | "BLOCKED" | "BROKEN";

export type SeatEntity = {
    seatId: number;
    seatRow: string;
    seatColumn: number;
    status: SeatStatus;
    seatType: SeatTypeEntity;
    room: RoomEntity;
};

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

export type SeatResponse = SeatEntity & {
    seatTypeId?: number;
    roomId?: number;
    seatType?: SeatTypeResponse;
    room?: RoomResponse;
};

export type { SeatTypeStatus } from "./seat-type";
export type SeatCreationRequest = SeatCreationResquest;
export type SeatUpdateRequest = SeatUpdateResquest;
export type SeatType = SeatTypeResponse;
export type Seat = SeatResponse & { isPrimary?: boolean };
