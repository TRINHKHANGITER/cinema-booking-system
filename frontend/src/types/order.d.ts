import type { UserResponse } from "./user";
import type { PaymentStatus } from "./payment";
import type { ShowTimeSeatStatus } from "./showtime-seat";
import type { OrderComboStatus } from "./orderCombo";
import type { TicketStatus } from "./ticket";

export type OrderStatus = "PAYING" | "PAID" | "CANCELLED" | "REFUNDED" | "EXPIRED";

export type OrderEntity = {
    orderId: number;
    userId: number | null;
    user?: UserResponse | null;
    showTimeId: number;
    ticketTotal: number;
    comboTotal: number;
    discountAmount: number;
    totalAmount: number;
    netAmount: number;
    expiredAt: string;
    createdAt: string;
    updatedAt: string;
    status: OrderStatus;
};

export type OrderCreationRequest = {
    userId?: number;
    showTimeId: number;
};

export type OrderUpdateRequest = {
    status?: OrderStatus;
};

export type OrderFilterParams = {
    customerName?: string;
    email?: string;
    phone?: string;
    showTimeId?: number;
    status?: OrderStatus | "";
    page?: number;
    size?: number;
};

export type OrderStatusUpdateRequest = {
    status: OrderStatus;
};

export type OrderShowTimeDetail = {
    showTimeId: number;
    releaseDate: string;
    startTime: string;
    endTime: string;
    movieId: number;
    movieName: string;
    roomId: number;
    roomName: string;
    cinemaId: number;
    cinemaName: string;
    provinceId: number;
    provinceName: string;
};

export type OrderSeatDetail = {
    ticketId: number | null;
    seatId: number;
    seatRow: string;
    seatColumn: number;
    seatLabel: string;
    seatTypeId: number;
    seatTypeName: string;
    showTimeSeatStatus: ShowTimeSeatStatus | null;
    unitPrice: number | null;
    ticketStatus: TicketStatus | null;
};

export type OrderComboDetail = {
    orderComboId: number;
    comboId: number;
    comboName: string;
    comboImage: string | null;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    status: OrderComboStatus | null;
};

export type OrderPaymentDetail = {
    paymentId: number;
    amount: number;
    method: string | null;
    bankCode: string | null;
    bankTransactionNo: string | null;
    transactionId: string | null;
    infoTransaction: string | null;
    paidAt: string | null;
    createdAt: string;
    updatedAt: string;
    status: PaymentStatus;
};

export type OrderDetail = {
    orderId: number;
    userId: number | null;
    user: UserResponse | null;
    status: OrderStatus;
    ticketTotal: number;
    comboTotal: number;
    discountAmount: number;
    totalAmount: number;
    netAmount: number;
    expiredAt: string | null;
    createdAt: string;
    updatedAt: string;
    showTime: OrderShowTimeDetail;
    seats: OrderSeatDetail[];
    combos: OrderComboDetail[];
    payments: OrderPaymentDetail[];
    paidAt: string | null;
    vnpayTransactionId: string | null;
    bankTransactionNo: string | null;
    bankCode: string | null;
};

export type Order = OrderEntity;
export type OrderResponse = OrderEntity;
