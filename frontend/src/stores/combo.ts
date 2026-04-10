import { create } from "zustand";
import type { FoodState } from "../types/store";

import { toast } from "sonner";
import { comboService } from "../services/combo.service";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
const useFoodStore = create<FoodState>((set) => ({
  combo: [],
  comboSelected: null,
  loading: false,
  error: null,

  fetchFoods: async () => {
    set({ loading: true, error: null });
    try {
      const products = await comboService.getCombo();
      set({ combo: products.data, loading: false });
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Có lỗi xảy ra, vui lòng thử lại";

      toast.error(message);
      set({ loading: false });
      throw error;
    }
  },
}));

export default useFoodStore;
