import type { UserEntity } from "./user";

export type OrderStatus =
    | "CREATED"
    | "HOLDING"
    | "AWAITING_PAYMENT"
    | "PAID"
    | "CANCELLED"
    | "EXPIRED"
    | "REFUNDED";

export type OrderEntity = {
    orderId: number;
    user: UserEntity;
    ticketTotal: number;
    comboTotal: number;
    discountAmount: number;
    totalAmount: number;
    holdExpiresAt: string | null;
    note: string | null;
    createdAt: string;
    updatedAt: string;
    status: OrderStatus;
};

export type Orders = OrderEntity;
