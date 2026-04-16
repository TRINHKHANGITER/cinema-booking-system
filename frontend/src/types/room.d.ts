import type { CinemaEntity, CinemaResponse } from "./cinema";
import type { RoomTypeEntity, RoomTypeResponse } from "./room-type";

export type RoomStatus = "ACTIVE" | "INACTIVE" | "UNDER_MAINTENANCE";

export type RoomEntity = {
    roomId: number;
    roomName: string;
    capacity: number;
    status: RoomStatus;
    roomType: RoomTypeEntity;
    cinema: CinemaEntity;
};

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

export type RoomResponse = RoomEntity & {
    roomTypeId?: number;
    cinemaId?: number;
    roomType?: RoomTypeResponse;
    cinema?: CinemaResponse;
};

export type RoomCreationRequest = RoomCreationResquest;
export type RoomUpdateRequest = RoomUpdateResquest;
export type Room = RoomResponse;
