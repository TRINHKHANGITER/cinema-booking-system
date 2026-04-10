import { create } from "zustand";
import type { BookingState } from "../types/store";
import { bookingService } from "../services/booking.service";
import { toast } from "sonner";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
const useBookingStore = create<BookingState>((set, get) => ({
  showDetail: null,
  selectedSeats: [],
  selectedCombos: [],
  loading: false,
  error: null,

  // Lấy thông tin suất chiếu
  fetchShowDetail: async (showId: number) => {
    set({ loading: true, error: null });
    try {
      const res = await bookingService.getShowDetail(showId);
      set({ showDetail: res.data, loading: false });
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
  // combo
  toggleCombo: (combo, delta) => {
    const { selectedCombos } = get();
    const exists = selectedCombos.find((c) => c.comboId === combo.comboId);

    if (!exists && delta > 0) {
      set({ selectedCombos: [...selectedCombos, { ...combo, quantity: 1 }] });
    } else if (exists) {
      const newQty = exists.quantity + delta;
      if (newQty <= 0) {
        set({
          selectedCombos: selectedCombos.filter(
            (c) => c.comboId !== combo.comboId,
          ),
        });
      } else {
        set({
          selectedCombos: selectedCombos.map((c) =>
            c.comboId === combo.comboId ? { ...c, quantity: newQty } : c,
          ),
        });
      }
    }
  },

  resetBooking: () => {
    set({
      showDetail: null,
      selectedSeats: [],
      selectedCombos: [],
      loading: false,
      error: null,
    });
  },
}));

export default useBookingStore;
