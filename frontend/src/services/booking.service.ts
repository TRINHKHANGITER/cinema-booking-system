import api from "../lib/axios";

export const bookingService = {
  getShowDetail: async (showId: number) => {
    const res = await api.get(`/booking`, { params: { id: showId } });
    return res.data;
  },
};
