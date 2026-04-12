import type { Room } from "./showtime";

export type SeatTypeStatus = "ACTIVE" | "INACTIVE";
export type SeatStatus = "ACTIVE" | "BLOCKED" | "BROKEN";

export interface SeatType {
  seatTypeId: number;
  seatTypeName: string;
  description: string | null;
  status: SeatTypeStatus;
}

export interface Seat {
  seatId: number;
  seatRow: string;
  seatColumn: number;
  seatType: SeatType;
  room: Room;
  seatTypeId: number;
  roomId: number;
  status: SeatStatus;
  isPrimary?: boolean;
}
