import type { ComboEntity } from "./combo";
import type { OrderEntity } from "./order";

export type OrderComboStatus = "ACTIVE" | "CANCELLED";

export type OrderComboEntity = {
    orderComboId: number;
    order: OrderEntity | null;
    combo: ComboEntity | null;
    orderId?: number;
    comboId?: number;
    quantity: number;
    unitPrice: number;
    status: OrderComboStatus;
};

export type OrderComboRequest = {
    orderId: number;
    comboId: number;
    quantity: number;
};

export type OrderComboStatusUpdateRequest = {
    status: OrderComboStatus;
};

export type OrderCombo = OrderComboEntity;
