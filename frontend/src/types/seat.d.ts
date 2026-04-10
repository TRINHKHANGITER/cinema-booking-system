export interface SeatType {
  seatTypeId: number;
  seatTypeName: string;
  description: string;
  status: boolean;
}
export interface Price {
  priceTicketId: number;
  ticketTypeId: number;
  ticketTypeName: string;
  price: number;
}
export interface Seat {
  seatId: number;
  seatTypeId: number;
  roomId: number;
  seatRow: string;
  seatColumn: number;
  status: boolean;
  seattype: SeatType;
  prices: Price[];
  isPrimary?: boolean; //dùng để không tính tiền 2 lần ghế đôi
}
export interface SeatResponse {
  data: Seat[];
}
