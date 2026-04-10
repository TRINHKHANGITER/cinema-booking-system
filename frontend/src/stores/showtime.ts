import { create } from "zustand";
import { toast } from "sonner";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { ShowtimeState } from "../types/store";
import { showTimeService } from "../services/showtimeService";

const useShowtimeStore = create<ShowtimeState>((set) => ({
  showtimes: [],
  loading: false,
  error: null,
  selectedDate: new Date().toISOString().slice(0, 10),
  setSelectedDate: (date) => set({ selectedDate: date }),
  fetchShowtimeByMovie: async (slug: string) => {
    set({ loading: true, error: null });
    try {
      const res = await showTimeService.getShowTimeBySlug(slug);
      console.log(res.data);

      set({ showtimes: res.data, loading: false });
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error?.message || "Có lỗi xảy ra";

      toast.error(message);
      set({ loading: false });
    }
  },
}));

export default useShowtimeStore;
