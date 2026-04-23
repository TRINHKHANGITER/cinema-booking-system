export type ComboStatus = "AVAILABLE" | "UNAVAILABLE" | "DISCONTINUED";

export type ComboEntity = {
    comboId: number;
    comboName: string;
    image: string | null;
    description: string | null;
    price: number;
    status: ComboStatus;
};

export type ComboRequest = {
    comboId: number;
    quantity: number;
};

export type ComboCreationRequest = {
    comboName: string;
    description: string;
    price: number;
    status?: ComboStatus;
    image?: File | null;
};

export type ComboUpdateRequest = {
    comboName?: string;
    description?: string;
    price?: number;
    status?: ComboStatus;
    image?: File | null;
};

export type ComboFilterParams = {
    name?: string;
    status?: ComboStatus | "";
    page?: number;
    size?: number;
};

export type ComboResponse = ComboEntity;
export type Combo = ComboEntity;
export type SelectedCombo = ComboEntity & { quantity: number };
