export type ShowTimeSeatStatus = "AVAILABLE" | "HELD" | "SOLD" | "BLOCKED";

export type ShowTimeSeat = {
    showTimeSeatId: number;
    showTimeId: number;
    seatId: number;
    seatRow: string;
    seatColumn: number;
    seatTypeId: number;
    seatTypeName: string;
    status: ShowTimeSeatStatus;
    holdExpiresAt: string | null;
    orderId: number | null;
};

export type HoldSeatRequest = {
    userId?: number;
    showTimeId: number;
    orderId?: number | null;
    seatIds: number[];
};

export type ReleaseSeatRequest = {
    orderId: number;
    seatIds: number[];
};

export type HoldSeatResponse = {
    orderId: number;
    showTimeId: number;
    expiredAt: string;
    ticketTotal: number;
    comboTotal: number;
    discountAmount: number;
    totalAmount: number;
    netAmount: number;
    heldSeats: ShowTimeSeat[];
};
