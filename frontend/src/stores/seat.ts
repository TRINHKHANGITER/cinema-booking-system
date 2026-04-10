import { create } from "zustand";
import { toast } from "sonner";
import type { SeatState } from "../types/store";
import { seatService } from "../services/seat.service";
import type { Seat } from "../types/seat";

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

const useSeatStore = create<SeatState>((set, get) => ({
  seats: [],
  selectedSeats: [],
  loading: false,
  error: null,

  fetchSeats: async (showId: number) => {
    set({ loading: true, error: null });
    try {
      const res = await seatService.getSeatByTheater(showId);
      set({ seats: res.data, loading: false });
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Có lỗi xảy ra, vui lòng thử lại";
      toast.error(message);
      set({ loading: false, error: message });
      throw error;
    }
  },

  toggleSeat: (seat: Seat, allSeats: Seat[]) => {
    const { selectedSeats } = get();
    const isCoupleSeat = seat.seattype?.seatTypeId === 3;

    if (isCoupleSeat) {
      // Tìm ghế cặp đôi liền kề (cùng hàng, column lẻ-chẵn)
      const partnerColumn =
        seat.seatColumn % 2 === 0 ? seat.seatColumn - 1 : seat.seatColumn + 1;

      const partnerSeat = allSeats.find(
        (s) =>
          s.seatRow === seat.seatRow &&
          s.seatColumn === partnerColumn &&
          s.seattype?.seatTypeId === 3,
      );

      const isSelected = selectedSeats.some((s) => s.seatId === seat.seatId);

      if (isSelected) {
        // Bỏ chọn cả 2 ghế
        const idsToRemove = new Set(
          [seat.seatId, partnerSeat?.seatId].filter(Boolean),
        );
        set({
          selectedSeats: selectedSeats.filter(
            (s) => !idsToRemove.has(s.seatId),
          ),
        });
      } else {
        // Chọn cả 2 ghế, đánh dấu ghế phụ để không tính tiền
        const seatsToAdd: Seat[] = [
          { ...seat, isPrimary: true },
          ...(partnerSeat ? [{ ...partnerSeat, isPrimary: false }] : []),
        ].filter((s) => !selectedSeats.some((sel) => sel.seatId === s.seatId));

        set({ selectedSeats: [...selectedSeats, ...seatsToAdd] });
      }
    } else {
      // Ghế thường
      const exists = selectedSeats.some((s) => s.seatId === seat.seatId);
      if (exists) {
        set({
          selectedSeats: selectedSeats.filter((s) => s.seatId !== seat.seatId),
        });
      } else {
        set({
          selectedSeats: [...selectedSeats, { ...seat, isPrimary: true }],
        });
      }
    }
  },

  resetSeats: () => {
    set({ seats: [], selectedSeats: [], loading: false, error: null });
  },
}));

export default useSeatStore;
