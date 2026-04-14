import type { CinemaResponse } from "./cinema";
import type { MovieEntity, MovieResponse } from "./movie";
import type { ProvinceResponse } from "./province";
import type { RoomEntity, RoomResponse } from "./room";
import type { RoomTypeResponse } from "./room-type";

export type ShowTimeStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";

export type ShowTimeEntity = {
    showTimeId: number;
    releaseDate: string;
    startTime: string;
    endTime: string;
    status: ShowTimeStatus;
    movie: MovieEntity;
    room: RoomEntity;
};

export type ShowTimeCreationResquest = {
    startTime: string;
    endTime: string;
    roomId: number;
    movieId: number;
};

export type ShowTimeUpdateResquest = {
    startTime?: string;
    endTime?: string;
    roomId?: number;
    movieId?: number;
};

export type ShowTimeResponse = ShowTimeEntity & {
    roomId?: number;
    movieId?: number;
    room?: RoomResponse;
    movie?: MovieResponse;
};

export type ShowTimeSearchDto = {
    showTimeId: number;
    startTime: string;
    endTime: string;
    movieId: number;
    movieName: string;
    movieTypeName: string;
    cinemaId: number;
    cinemaName: string;
    roomId: number;
    roomName: string;
    roomTypeName: string;
};

export type ShowTimeSearchRequest = {
    keyword?: string | null;
    movieTypeId?: number | null;
    cinemaId?: number | null;
    roomTypeId?: number | null;
    dateFrom?: string | null;
    dateTo?: string | null;
    timeFrom?: string | null;
    timeTo?: string | null;
    page?: number | null;
    size?: number | null;
};

export type { CinemaStatus } from "./cinema";
export type { ProvinceStatus } from "./province";
export type { RoomStatus } from "./room";
export type { RoomTypeStatus } from "./room-type";

export type ShowTimeCreationRequest = ShowTimeCreationResquest;
export type ShowTimeUpdateRequest = ShowTimeUpdateResquest;

export type Province = ProvinceResponse;
export type Cinema = CinemaResponse;
export type RoomType = RoomTypeResponse;
export type Room = RoomResponse;
export type ShowtimeDetail = ShowTimeResponse;
export type ShowtimeSearchItem = ShowTimeSearchDto;
export type Showtime = ShowtimeSearchItem;
