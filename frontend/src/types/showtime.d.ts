import type { Movie } from "./product";

export type ProvinceStatus = "ACTIVE" | "INACTIVE";
export type CinemaStatus = "ACTIVE" | "INACTIVE" | "UNDER_MAINTENANCE";
export type RoomTypeStatus = "ACTIVE" | "INACTIVE";
export type RoomStatus = "ACTIVE" | "INACTIVE" | "UNDER_MAINTENANCE";
export type ShowTimeStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";

export interface Province {
  provinceId: number;
  provinceName: string;
  status: ProvinceStatus;
}

export interface Cinema {
  cinemaId: number;
  cinemaName: string;
  province: Province;
  provinceId: number;
  provinceName: string;
  addressText: string;
  description: string | null;
  status: CinemaStatus;
}

export interface RoomType {
  roomTypeId: number;
  roomTypeName: string;
  description: string | null;
  status: RoomTypeStatus;
}

export interface Room {
  roomId: number;
  roomName: string;
  capacity: number;
  roomType: RoomType;
  cinema: Cinema;
  roomTypeId: number;
  cinemaId: number;
  status: RoomStatus;
}

export interface ShowtimeDetail {
  showTimeId: number;
  releaseDate: string;
  startTime: string;
  endTime: string;
  room: Room;
  movie: Movie;
  roomId: number;
  movieId: number;
  status: ShowTimeStatus;
}

export interface ShowtimeSearchItem {
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
}

export type Showtime = ShowtimeSearchItem;
