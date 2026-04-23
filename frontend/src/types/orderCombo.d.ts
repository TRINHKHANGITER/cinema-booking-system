import type { ComboEntity } from "./combo";
import type { OrderEntity } from "./order";

export type OrderComboStatus = "ACTIVE" | "CANCELLED";

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
