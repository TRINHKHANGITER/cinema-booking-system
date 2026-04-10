import api from "../lib/axios";

export const seatService = {
  getSeatByTheater: async (roomId: number) => {
    const res = await api.get(`/seat`, { params: { id: roomId } });
    return res.data;
  },
};
