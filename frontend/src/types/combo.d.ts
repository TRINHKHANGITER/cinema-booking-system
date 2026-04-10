export interface comboFood {
  comboId: number;
  comboName: string;
  description: string;
  price: string;
  status: number;
}

export interface SelectedCombo extends comboFood {
  quantity: number;
}
