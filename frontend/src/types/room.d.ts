import type { CinemaResponse } from "./cinema";
import type { RoomTypeResponse } from "./room-type";

export type RoomStatus = "ACTIVE" | "INACTIVE" | "UNDER_MAINTENANCE";

export type RoomCreationResquest = {
    roomName: string;
    capacity: number;
    roomTypeId: number;
    cinemaId: number;
};

export type RoomUpdateResquest = {
    roomName?: string;
    capacity?: number;
    roomTypeId?: number;
    cinemaId?: number;
};

export type RoomResponse = {
    roomId: number;
    roomName: string;
    capacity: number;
    roomType: RoomTypeResponse;
    cinema: CinemaResponse;
    roomTypeId: number;
    cinemaId: number;
    status: RoomStatus;
};

export type RoomCreationRequest = RoomCreationResquest;
export type RoomUpdateRequest = RoomUpdateResquest;
export type Room = RoomResponse;
