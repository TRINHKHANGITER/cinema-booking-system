export type ProductTypeStatus = "ACTIVE" | "INACTIVE";

export type ProductTypeEntity = {
    productTypeId: number;
    productTypeName: string;
    description: string | null;
    status: ProductTypeStatus;
};

export type ProductType = ProductTypeEntity;
