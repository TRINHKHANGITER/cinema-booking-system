export interface comboFood {
  comboId: number;
  comboName: string;
  description: string;
  price: number;
  status: string;
}

export interface SelectedCombo extends comboFood {
  quantity: number;
}
