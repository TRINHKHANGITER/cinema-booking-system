import api from "../lib/axios";

export const comboService = {
  getCombo: async () => {
    const res = await api.get(`/combo`);
    return res.data;
  },
};
