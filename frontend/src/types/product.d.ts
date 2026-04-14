import type { ProductTypeEntity } from "./productType";

export type ProductStatus = "AVAILABLE" | "UNAVAILABLE" | "DISCONTINUED";

export type ProductEntity = {
    productId: number;
    productName: string;
    image: string | null;
    price: number;
    status: ProductStatus;
    productType: ProductTypeEntity;
};

export type Product = ProductEntity;

export type { Movie } from "./movie";
