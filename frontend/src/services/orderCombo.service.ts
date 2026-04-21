import axios from "axios";
import type { OrderComboRequest, OrderComboStatus } from "../types/orderCombo";

export const orderComboService = {
    createOrderCombo: async (data: OrderComboRequest) => {
        const res = await axios.post(`/orderCombo`, data);
        return res.data;
    },

    getOrderComboById: async (orderComboId: number) => {
        const res = await axios.get(`/orderCombo/${orderComboId}`);
        return res.data;
    },

    getOrdersCombo: async (status?: OrderComboStatus) => {
        const res = await axios.get(`/orderCombo`, {
            params: {
                status,
            },
        });
        return res.data;
    },
};
