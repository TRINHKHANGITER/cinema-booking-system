import api from "../lib/axios";

export const showTimeService = {
  getShowTimeBySlug: async (slug: string) => {
    const res = await api.get(`/showtimes/${slug}`);
    return res.data;
  },
};
