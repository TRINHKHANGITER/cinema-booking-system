import type { ComboEntity } from "./combo";
import type { ProductEntity } from "./product";

export type ComboDetailStatus = "ACTIVE" | "INACTIVE";

export type ComboDetailEntity = {
    comboDetailId: number;
    combo: ComboEntity;
    product: ProductEntity;
    quantity: number;
    status: ComboDetailStatus;
};

export type ComboDetail = ComboDetailEntity;
