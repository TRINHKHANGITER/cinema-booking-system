export type comboFood = {
    comboId: number;
    comboName: string;
    description: string;
    price: number;
    status: string;
};

export type SelectedCombo = comboFood & {
    quantity: number;
};
