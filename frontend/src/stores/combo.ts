import { create } from "zustand";
import type { FoodState } from "../types/store";
import { toast } from "sonner";
import { comboService } from "../services/combo.service";
/* eslint-disable @typescript-eslint/no-explicit-any */

const useFoodStore = create<FoodState>((set) => ({
  combo: [],
  comboSelected: null,
  loading: false,
  error: null,

  fetchFoods: async () => {
    set({ loading: true, error: null });
    try {
      const combo = await comboService.getCombo();
      set({ combo, loading: false });
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Có l?i x?y ra, vui lòng th? l?i";

      toast.error(message);
      set({ loading: false });
      throw error;
    }
  },
}));

export default useFoodStore;
