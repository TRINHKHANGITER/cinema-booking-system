import axios from "axios";
import type { ComboStatus } from "../types/combo";

export const comboService = {
    getComboById: async (comboId: number) => {
        const res = await axios.get(`/combo/${comboId}`);
        return res.data;
    },

    getCombos: async (status?: ComboStatus) => {
        const res = await axios.get(`/combo`, {
            params: {
                status,
            },
        });
        return res.data;
    },
};
