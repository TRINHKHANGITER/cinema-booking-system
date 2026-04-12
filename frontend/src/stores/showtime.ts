import { create } from "zustand";
import { toast } from "sonner";
import type { ShowtimeState } from "../types/store";
import { showTimeService } from "../services/showtimeService";
/* eslint-disable @typescript-eslint/no-explicit-any */

const useShowtimeStore = create<ShowtimeState>((set) => ({
  showtimes: [],
  loading: false,
  error: null,
  selectedDate: new Date().toISOString().slice(0, 10),
  setSelectedDate: (date) => set({ selectedDate: date }),

  fetchShowtimeByMovie: async (keyword: string) => {
    set({ loading: true, error: null });
    try {
      const showtimes = await showTimeService.getShowTimeByMovieKeyword(keyword);
      set({ showtimes, loading: false });
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error?.message || "Có l?i x?y ra";

      toast.error(message);
      set({ loading: false, error: message });
    }
  },
}));

export default useShowtimeStore;
