import type { ComboEntity } from "./combo";
import type { OrderEntity } from "./orders";

export type OrderComboStatus = "ACTIVE" | "CANCELLED" | "REFUNDED";

export type OrderComboEntity = {
    orderComboId: number;
    order: OrderEntity;
    combo: ComboEntity;
    quantity: number;
    unitPrice: number;
    status: OrderComboStatus;
};

export type OrderComboRequest = {
    orderId: number;
    comboId: number;
    quantity: number;
};


export type OrderCombo = OrderComboEntity;
