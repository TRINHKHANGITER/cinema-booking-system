export type ComboStatus = "AVAILABLE" | "UNAVAILABLE" | "DISCONTINUED";

export type ComboEntity = {
    comboId: number;
    comboName: string;
    image: string | null;
    description: string | null;
    price: number;
    status: ComboStatus;
};

export type Combo = ComboEntity;
export type SelectedCombo = ComboEntity & { quantity: number };
